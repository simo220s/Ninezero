/**
 * Accessibility Utilities
 * Helper functions for WCAG 2.1 AA compliance
 * 
 * @version 1.0.0
 * @description Utilities for keyboard navigation, ARIA attributes, and focus management
 */

/**
 * Trap focus within a container (for modals, dialogs)
 * @param container - The container element to trap focus within
 * @returns Cleanup function to remove event listeners
 */
export function trapFocus(container: HTMLElement): () => void {
  const focusableElements = container.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  
  const firstFocusable = focusableElements[0]
  const lastFocusable = focusableElements[focusableElements.length - 1]
  
  // Store the element that had focus before the trap
  const previouslyFocused = document.activeElement as HTMLElement
  
  // Focus the first element
  firstFocusable?.focus()
  
  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return
    
    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstFocusable) {
        e.preventDefault()
        lastFocusable?.focus()
      }
    } else {
      // Tab
      if (document.activeElement === lastFocusable) {
        e.preventDefault()
        firstFocusable?.focus()
      }
    }
  }
  
  container.addEventListener('keydown', handleTabKey)
  
  // Cleanup function
  return () => {
    container.removeEventListener('keydown', handleTabKey)
    // Return focus to previously focused element
    previouslyFocused?.focus()
  }
}

/**
 * Check if an element is focusable
 * @param element - The element to check
 * @returns True if the element is focusable
 */
export function isFocusable(element: HTMLElement): boolean {
  if (element.tabIndex < 0) return false
  if (element.hasAttribute('disabled')) return false
  if (element.getAttribute('aria-hidden') === 'true') return false
  
  const tagName = element.tagName.toLowerCase()
  const focusableTags = ['a', 'button', 'input', 'select', 'textarea']
  
  if (focusableTags.includes(tagName)) return true
  if (element.tabIndex >= 0) return true
  
  return false
}

/**
 * Get all focusable elements within a container
 * @param container - The container to search within
 * @returns Array of focusable elements
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  const elements = Array.from(container.querySelectorAll<HTMLElement>(selector))
  
  return elements.filter(el => {
    return !el.hasAttribute('disabled') && 
           el.getAttribute('aria-hidden') !== 'true' &&
           el.offsetParent !== null // Check if visible
  })
}

/**
 * Announce message to screen readers
 * @param message - The message to announce
 * @param priority - The priority level ('polite' or 'assertive')
 */
export function announceToScreenReader(
  message: string, 
  priority: 'polite' | 'assertive' = 'polite'
): void {
  const announcement = document.createElement('div')
  announcement.setAttribute('role', 'status')
  announcement.setAttribute('aria-live', priority)
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message
  
  document.body.appendChild(announcement)
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

/**
 * Generate unique ID for ARIA attributes
 * @param prefix - Optional prefix for the ID
 * @returns Unique ID string
 */
export function generateAriaId(prefix: string = 'aria'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Check if reduced motion is preferred
 * @returns True if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Check if high contrast is preferred
 * @returns True if user prefers high contrast
 */
export function prefersHighContrast(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-contrast: high)').matches
}

/**
 * Calculate contrast ratio between two colors
 * @param color1 - First color in hex format
 * @param color2 - Second color in hex format
 * @returns Contrast ratio (1-21)
 */
export function getContrastRatio(color1: string, color2: string): number {
  const getLuminance = (hex: string): number => {
    // Remove # if present
    hex = hex.replace('#', '')
    
    // Convert to RGB
    const r = parseInt(hex.substr(0, 2), 16) / 255
    const g = parseInt(hex.substr(2, 2), 16) / 255
    const b = parseInt(hex.substr(4, 2), 16) / 255
    
    // Apply gamma correction
    const [rs, gs, bs] = [r, g, b].map(c => {
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    
    // Calculate relative luminance
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }
  
  const lum1 = getLuminance(color1)
  const lum2 = getLuminance(color2)
  
  const lighter = Math.max(lum1, lum2)
  const darker = Math.min(lum1, lum2)
  
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Check if contrast ratio meets WCAG AA standard
 * @param color1 - First color in hex format
 * @param color2 - Second color in hex format
 * @param isLargeText - Whether the text is large (18pt+ or 14pt+ bold)
 * @returns True if contrast meets WCAG AA
 */
export function meetsWCAGAA(
  color1: string, 
  color2: string, 
  isLargeText: boolean = false
): boolean {
  const ratio = getContrastRatio(color1, color2)
  return isLargeText ? ratio >= 3 : ratio >= 4.5
}

/**
 * Check if contrast ratio meets WCAG AAA standard
 * @param color1 - First color in hex format
 * @param color2 - Second color in hex format
 * @param isLargeText - Whether the text is large (18pt+ or 14pt+ bold)
 * @returns True if contrast meets WCAG AAA
 */
export function meetsWCAGAAA(
  color1: string, 
  color2: string, 
  isLargeText: boolean = false
): boolean {
  const ratio = getContrastRatio(color1, color2)
  return isLargeText ? ratio >= 4.5 : ratio >= 7
}

/**
 * Keyboard navigation handler for arrow keys in lists/menus
 * @param event - The keyboard event
 * @param items - Array of focusable items
 * @param currentIndex - Current focused index
 * @param options - Configuration options
 * @returns New focused index
 */
export function handleArrowNavigation(
  event: KeyboardEvent,
  items: HTMLElement[],
  currentIndex: number,
  options: {
    loop?: boolean
    horizontal?: boolean
  } = {}
): number {
  const { loop = true, horizontal = false } = options
  const upKey = horizontal ? 'ArrowLeft' : 'ArrowUp'
  const downKey = horizontal ? 'ArrowRight' : 'ArrowDown'
  
  let newIndex = currentIndex
  
  if (event.key === upKey) {
    event.preventDefault()
    newIndex = currentIndex - 1
    if (newIndex < 0) {
      newIndex = loop ? items.length - 1 : 0
    }
  } else if (event.key === downKey) {
    event.preventDefault()
    newIndex = currentIndex + 1
    if (newIndex >= items.length) {
      newIndex = loop ? 0 : items.length - 1
    }
  } else if (event.key === 'Home') {
    event.preventDefault()
    newIndex = 0
  } else if (event.key === 'End') {
    event.preventDefault()
    newIndex = items.length - 1
  }
  
  if (newIndex !== currentIndex && items[newIndex]) {
    items[newIndex].focus()
  }
  
  return newIndex
}

/**
 * Create skip link for keyboard navigation
 * @param targetId - ID of the main content element
 * @returns Skip link element
 */
export function createSkipLink(targetId: string = 'main-content'): HTMLAnchorElement {
  const skipLink = document.createElement('a')
  skipLink.href = `#${targetId}`
  skipLink.className = 'skip-to-main'
  skipLink.textContent = 'Skip to main content'
  skipLink.addEventListener('click', (e) => {
    e.preventDefault()
    const target = document.getElementById(targetId)
    if (target) {
      target.focus()
      target.scrollIntoView()
    }
  })
  
  return skipLink
}

/**
 * Ensure element has accessible name
 * @param element - The element to check
 * @returns True if element has accessible name
 */
export function hasAccessibleName(element: HTMLElement): boolean {
  // Check aria-label
  if (element.getAttribute('aria-label')) return true
  
  // Check aria-labelledby
  if (element.getAttribute('aria-labelledby')) return true
  
  // Check title
  if (element.getAttribute('title')) return true
  
  // Check text content for buttons/links
  const tagName = element.tagName.toLowerCase()
  if (['button', 'a'].includes(tagName) && element.textContent?.trim()) {
    return true
  }
  
  // Check label for inputs
  if (tagName === 'input') {
    const id = element.id
    if (id && document.querySelector(`label[for="${id}"]`)) {
      return true
    }
  }
  
  return false
}

/**
 * Validate ARIA attributes
 * @param element - The element to validate
 * @returns Array of validation errors
 */
export function validateARIA(element: HTMLElement): string[] {
  const errors: string[] = []
  
  // Check for invalid ARIA attributes
  const ariaAttributes = Array.from(element.attributes)
    .filter(attr => attr.name.startsWith('aria-'))
  
  // Check role
  const role = element.getAttribute('role')
  if (role) {
    const validRoles = [
      'alert', 'alertdialog', 'application', 'article', 'banner', 'button',
      'checkbox', 'columnheader', 'combobox', 'complementary', 'contentinfo',
      'definition', 'dialog', 'directory', 'document', 'feed', 'figure',
      'form', 'grid', 'gridcell', 'group', 'heading', 'img', 'link', 'list',
      'listbox', 'listitem', 'log', 'main', 'marquee', 'math', 'menu',
      'menubar', 'menuitem', 'menuitemcheckbox', 'menuitemradio', 'navigation',
      'none', 'note', 'option', 'presentation', 'progressbar', 'radio',
      'radiogroup', 'region', 'row', 'rowgroup', 'rowheader', 'scrollbar',
      'search', 'searchbox', 'separator', 'slider', 'spinbutton', 'status',
      'switch', 'tab', 'table', 'tablist', 'tabpanel', 'term', 'textbox',
      'timer', 'toolbar', 'tooltip', 'tree', 'treegrid', 'treeitem'
    ]
    
    if (!validRoles.includes(role)) {
      errors.push(`Invalid ARIA role: ${role}`)
    }
  }
  
  // Check for required ARIA attributes based on role
  if (role === 'button' && !hasAccessibleName(element)) {
    errors.push('Button role requires accessible name')
  }
  
  if (role === 'checkbox' && !element.hasAttribute('aria-checked')) {
    errors.push('Checkbox role requires aria-checked attribute')
  }
  
  return errors
}


