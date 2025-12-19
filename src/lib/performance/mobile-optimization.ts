/**
 * Mobile Optimization Utilities
 * 
 * Provides responsive design helpers and mobile-specific
 * optimizations for tablets and phones used by parents
 */

import { useState, useEffect } from 'react'

/**
 * Breakpoints for responsive design
 */
export const Breakpoints = {
  mobile: 640,    // sm
  tablet: 768,    // md
  desktop: 1024,  // lg
  wide: 1280,     // xl
} as const

export type DeviceType = 'mobile' | 'tablet' | 'desktop'

/**
 * Hook to detect current device type
 */
export function useDeviceType(): DeviceType {
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop')

  useEffect(() => {
    const updateDeviceType = () => {
      const width = window.innerWidth
      
      if (width < Breakpoints.tablet) {
        setDeviceType('mobile')
      } else if (width < Breakpoints.desktop) {
        setDeviceType('tablet')
      } else {
        setDeviceType('desktop')
      }
    }

    updateDeviceType()
    window.addEventListener('resize', updateDeviceType)
    
    return () => window.removeEventListener('resize', updateDeviceType)
  }, [])

  return deviceType
}

/**
 * Hook to detect if device is mobile
 */
export function useIsMobile(): boolean {
  const deviceType = useDeviceType()
  return deviceType === 'mobile'
}

/**
 * Hook to detect if device is tablet
 */
export function useIsTablet(): boolean {
  const deviceType = useDeviceType()
  return deviceType === 'tablet'
}

/**
 * Hook to detect if device is touch-enabled
 */
export function useIsTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    setIsTouch(
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0
    )
  }, [])

  return isTouch
}

/**
 * Hook for responsive values
 */
export function useResponsiveValue<T>(values: {
  mobile: T
  tablet?: T
  desktop: T
}): T {
  const deviceType = useDeviceType()
  
  if (deviceType === 'mobile') {
    return values.mobile
  } else if (deviceType === 'tablet') {
    return values.tablet ?? values.desktop
  } else {
    return values.desktop
  }
}

/**
 * Hook for window dimensions
 */
export function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  })

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return size
}

/**
 * Detect if user prefers reduced motion
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return prefersReducedMotion
}

/**
 * Detect network connection quality
 */
export function useNetworkStatus() {
  const [status, setStatus] = useState({
    online: navigator.onLine,
    effectiveType: 'unknown',
    downlink: 0,
    rtt: 0,
  })

  useEffect(() => {
    const updateStatus = () => {
      const connection = (navigator as any).connection || 
                        (navigator as any).mozConnection || 
                        (navigator as any).webkitConnection

      setStatus({
        online: navigator.onLine,
        effectiveType: connection?.effectiveType || 'unknown',
        downlink: connection?.downlink || 0,
        rtt: connection?.rtt || 0,
      })
    }

    updateStatus()

    window.addEventListener('online', updateStatus)
    window.addEventListener('offline', updateStatus)

    const connection = (navigator as any).connection
    if (connection) {
      connection.addEventListener('change', updateStatus)
    }

    return () => {
      window.removeEventListener('online', updateStatus)
      window.removeEventListener('offline', updateStatus)
      if (connection) {
        connection.removeEventListener('change', updateStatus)
      }
    }
  }, [])

  return status
}

/**
 * Responsive grid columns calculator
 */
export function getResponsiveColumns(deviceType: DeviceType): number {
  switch (deviceType) {
    case 'mobile':
      return 1
    case 'tablet':
      return 2
    case 'desktop':
      return 3
    default:
      return 3
  }
}

/**
 * Responsive font size calculator
 */
export function getResponsiveFontSize(
  baseSize: number,
  deviceType: DeviceType
): number {
  const scaleFactor = deviceType === 'mobile' ? 0.875 : 1
  return baseSize * scaleFactor
}

/**
 * Responsive spacing calculator
 */
export function getResponsiveSpacing(
  baseSpacing: number,
  deviceType: DeviceType
): number {
  const scaleFactor = deviceType === 'mobile' ? 0.75 : 1
  return baseSpacing * scaleFactor
}

/**
 * Touch-friendly button size
 */
export const TouchTargetSize = {
  minimum: 44, // iOS minimum
  recommended: 48, // Material Design recommendation
} as const

/**
 * Viewport utilities
 */
export const Viewport = {
  /**
   * Check if element is in viewport
   */
  isInViewport(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect()
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= window.innerHeight &&
      rect.right <= window.innerWidth
    )
  },

  /**
   * Scroll element into view smoothly
   */
  scrollIntoView(element: HTMLElement, options?: ScrollIntoViewOptions) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      ...options,
    })
  },

  /**
   * Get viewport height accounting for mobile browsers
   */
  getViewportHeight(): number {
    return window.visualViewport?.height || window.innerHeight
  },
}

/**
 * Mobile-specific performance optimizations
 */
export const MobilePerformance = {
  /**
   * Reduce animations on mobile
   */
  shouldReduceAnimations(deviceType: DeviceType): boolean {
    return deviceType === 'mobile'
  },

  /**
   * Reduce image quality on mobile
   */
  getImageQuality(deviceType: DeviceType): number {
    return deviceType === 'mobile' ? 0.7 : 0.85
  },

  /**
   * Get optimal page size for device
   */
  getOptimalPageSize(deviceType: DeviceType): number {
    switch (deviceType) {
      case 'mobile':
        return 10
      case 'tablet':
        return 15
      case 'desktop':
        return 20
      default:
        return 20
    }
  },
}

/**
 * Orientation detection
 */
export function useOrientation() {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
    window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
  )

  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(
        window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
      )
    }

    window.addEventListener('resize', handleOrientationChange)
    window.addEventListener('orientationchange', handleOrientationChange)

    return () => {
      window.removeEventListener('resize', handleOrientationChange)
      window.removeEventListener('orientationchange', handleOrientationChange)
    }
  }, [])

  return orientation
}

/**
 * Safe area insets for notched devices
 */
export function useSafeAreaInsets() {
  const [insets, setInsets] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  })

  useEffect(() => {
    const updateInsets = () => {
      const style = getComputedStyle(document.documentElement)
      setInsets({
        top: parseInt(style.getPropertyValue('--sat') || '0'),
        right: parseInt(style.getPropertyValue('--sar') || '0'),
        bottom: parseInt(style.getPropertyValue('--sab') || '0'),
        left: parseInt(style.getPropertyValue('--sal') || '0'),
      })
    }

    updateInsets()
    window.addEventListener('resize', updateInsets)
    
    return () => window.removeEventListener('resize', updateInsets)
  }, [])

  return insets
}
