import { useState, useEffect } from 'react'

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

interface BreakpointValues {
  xs: number  // 0px
  sm: number  // 640px
  md: number  // 768px
  lg: number  // 1024px
  xl: number  // 1280px
  '2xl': number // 1536px
}

const breakpoints: BreakpointValues = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
}

export function useResponsive() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768
  })

  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>('lg')

  useEffect(() => {
    function handleResize() {
      const width = window.innerWidth
      const height = window.innerHeight
      
      setWindowSize({ width, height })

      // Determine current breakpoint
      if (width >= breakpoints['2xl']) {
        setCurrentBreakpoint('2xl')
      } else if (width >= breakpoints.xl) {
        setCurrentBreakpoint('xl')
      } else if (width >= breakpoints.lg) {
        setCurrentBreakpoint('lg')
      } else if (width >= breakpoints.md) {
        setCurrentBreakpoint('md')
      } else if (width >= breakpoints.sm) {
        setCurrentBreakpoint('sm')
      } else {
        setCurrentBreakpoint('xs')
      }
    }

    // Set initial values
    handleResize()

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const isBreakpoint = (breakpoint: Breakpoint) => {
    return windowSize.width >= breakpoints[breakpoint]
  }

  const isMobile = windowSize.width < breakpoints.md
  const isTablet = windowSize.width >= breakpoints.md && windowSize.width < breakpoints.lg
  const isDesktop = windowSize.width >= breakpoints.lg

  // Touch device detection
  const isTouchDevice = typeof window !== 'undefined' && 
    ('ontouchstart' in window || navigator.maxTouchPoints > 0)

  // Orientation detection
  const isLandscape = windowSize.width > windowSize.height
  const isPortrait = windowSize.height >= windowSize.width

  return {
    windowSize,
    currentBreakpoint,
    isBreakpoint,
    isMobile,
    isTablet,
    isDesktop,
    isTouchDevice,
    isLandscape,
    isPortrait,
    breakpoints
  }
}

// Hook for responsive values
export function useResponsiveValue<T>(values: Partial<Record<Breakpoint, T>>): T | undefined {
  const { currentBreakpoint } = useResponsive()
  
  // Find the appropriate value for current breakpoint
  const breakpointOrder: Breakpoint[] = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs']
  const currentIndex = breakpointOrder.indexOf(currentBreakpoint)
  
  // Look for value starting from current breakpoint and going down
  for (let i = currentIndex; i < breakpointOrder.length; i++) {
    const bp = breakpointOrder[i]
    if (values[bp] !== undefined) {
      return values[bp]
    }
  }
  
  return undefined
}

// Hook for responsive classes
export function useResponsiveClasses() {
  const { isMobile, isTablet, currentBreakpoint } = useResponsive()
  
  return {
    container: `container-${currentBreakpoint}`,
    grid: {
      cols1: 'grid-cols-1',
      cols2: isMobile ? 'grid-cols-1' : 'grid-cols-2',
      cols3: isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-2' : 'grid-cols-3',
      cols4: isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-2' : 'grid-cols-4'
    },
    spacing: {
      section: isMobile ? 'py-12' : isTablet ? 'py-16' : 'py-20',
      container: isMobile ? 'px-4' : isTablet ? 'px-6' : 'px-8',
      gap: isMobile ? 'gap-4' : isTablet ? 'gap-6' : 'gap-8'
    },
    text: {
      hero: isMobile ? 'text-3xl' : isTablet ? 'text-4xl' : 'text-5xl',
      section: isMobile ? 'text-2xl' : isTablet ? 'text-3xl' : 'text-4xl',
      body: isMobile ? 'text-base' : 'text-lg'
    }
  }
}
