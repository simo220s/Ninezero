import { useEffect, useState } from 'react'

export function useAccessibility() {
  const [isHighContrast, setIsHighContrast] = useState(false)
  const [isReducedMotion, setIsReducedMotion] = useState(false)
  const [fontSize, setFontSize] = useState('normal')

  useEffect(() => {
    // Check for user preferences
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)')
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    
    setIsHighContrast(highContrastQuery.matches)
    setIsReducedMotion(reducedMotionQuery.matches)

    // Listen for changes
    const handleHighContrastChange = (e: MediaQueryListEvent) => {
      setIsHighContrast(e.matches)
    }
    
    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches)
    }

    highContrastQuery.addEventListener('change', handleHighContrastChange)
    reducedMotionQuery.addEventListener('change', handleReducedMotionChange)

    return () => {
      highContrastQuery.removeEventListener('change', handleHighContrastChange)
      reducedMotionQuery.removeEventListener('change', handleReducedMotionChange)
    }
  }, [])

  const increaseFontSize = () => {
    setFontSize(prev => {
      switch (prev) {
        case 'normal': return 'large'
        case 'large': return 'extra-large'
        default: return 'extra-large'
      }
    })
  }

  const decreaseFontSize = () => {
    setFontSize(prev => {
      switch (prev) {
        case 'extra-large': return 'large'
        case 'large': return 'normal'
        default: return 'normal'
      }
    })
  }

  const resetFontSize = () => {
    setFontSize('normal')
  }

  // Apply accessibility settings to document
  useEffect(() => {
    const root = document.documentElement
    
    // Font size classes
    root.classList.remove('font-size-normal', 'font-size-large', 'font-size-extra-large')
    root.classList.add(`font-size-${fontSize}`)
    
    // High contrast
    if (isHighContrast) {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }
    
    // Reduced motion
    if (isReducedMotion) {
      root.classList.add('reduced-motion')
    } else {
      root.classList.remove('reduced-motion')
    }
  }, [fontSize, isHighContrast, isReducedMotion])

  return {
    isHighContrast,
    isReducedMotion,
    fontSize,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize,
    setIsHighContrast,
    setIsReducedMotion
  }
}

// Hook for managing focus
export function useFocusManagement() {
  const [focusVisible, setFocusVisible] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setFocusVisible(true)
      }
    }

    const handleMouseDown = () => {
      setFocusVisible(false)
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleMouseDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleMouseDown)
    }
  }, [])

  return { focusVisible }
}

// Hook for screen reader announcements
export function useScreenReader() {
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div')
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

  return { announce }
}
