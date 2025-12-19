import { useEffect, useState } from 'react'
import { usePerformance } from './usePerformance'

interface OptimizedLoadingOptions {
  priority?: 'high' | 'medium' | 'low'
  defer?: boolean
  preload?: boolean
}

export function useOptimizedLoading(options: OptimizedLoadingOptions = {}) {
  const { isSlowConnection, performanceScore } = usePerformance()
  const [shouldLoad, setShouldLoad] = useState(!options.defer)
  const [isVisible, setIsVisible] = useState(false)

  const { priority = 'medium', defer = false } = options

  useEffect(() => {
    if (defer) {
      // Defer loading based on performance conditions
      const shouldDeferLoad = isSlowConnection || performanceScore < 60
      
      if (!shouldDeferLoad) {
        setShouldLoad(true)
      } else {
        // Load after a delay for slow connections
        const timer = setTimeout(() => {
          setShouldLoad(true)
        }, priority === 'high' ? 1000 : priority === 'medium' ? 2000 : 3000)
        
        return () => clearTimeout(timer)
      }
    }
  }, [defer, isSlowConnection, performanceScore, priority])

  // Intersection observer for lazy loading
  const observeElement = (element: HTMLElement | null) => {
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          setShouldLoad(true)
          observer.unobserve(element)
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    )

    observer.observe(element)
    return () => observer.unobserve(element)
  }

  return {
    shouldLoad,
    isVisible,
    isSlowConnection,
    performanceScore,
    observeElement,
    // Optimization flags
    shouldReduceAnimations: isSlowConnection || performanceScore < 70,
    shouldOptimizeImages: isSlowConnection || performanceScore < 80,
    shouldLimitContent: isSlowConnection && performanceScore < 50
  }
}

// Hook for progressive enhancement
export function useProgressiveEnhancement() {
  const [isEnhanced, setIsEnhanced] = useState(false)
  const { performanceScore, isSlowConnection } = usePerformance()

  useEffect(() => {
    // Enable enhancements based on performance
    const shouldEnhance = !isSlowConnection && performanceScore > 70
    
    if (shouldEnhance) {
      // Delay enhancement to avoid blocking initial render
      const timer = setTimeout(() => {
        setIsEnhanced(true)
      }, 100)
      
      return () => clearTimeout(timer)
    }
  }, [isSlowConnection, performanceScore])

  return {
    isEnhanced,
    shouldShowAnimations: isEnhanced && !isSlowConnection,
    shouldShowParallax: isEnhanced && performanceScore > 80,
    shouldShowParticles: isEnhanced && performanceScore > 85,
    shouldPreloadImages: isEnhanced && !isSlowConnection
  }
}

// Hook for adaptive loading strategies
export function useAdaptiveLoading() {
  const { isSlowConnection, performanceScore } = usePerformance()
  const [loadingStrategy, setLoadingStrategy] = useState<'eager' | 'lazy' | 'progressive'>('lazy')

  useEffect(() => {
    if (isSlowConnection || performanceScore < 50) {
      setLoadingStrategy('progressive')
    } else if (performanceScore > 80) {
      setLoadingStrategy('eager')
    } else {
      setLoadingStrategy('lazy')
    }
  }, [isSlowConnection, performanceScore])

  const getImageLoadingStrategy = () => {
    switch (loadingStrategy) {
      case 'eager':
        return { loading: 'eager' as const, priority: true }
      case 'progressive':
        return { loading: 'lazy' as const, priority: false, placeholder: true }
      default:
        return { loading: 'lazy' as const, priority: false }
    }
  }

  const getComponentLoadingStrategy = () => {
    switch (loadingStrategy) {
      case 'eager':
        return { preload: true, defer: false }
      case 'progressive':
        return { preload: false, defer: true }
      default:
        return { preload: false, defer: false }
    }
  }

  return {
    loadingStrategy,
    getImageLoadingStrategy,
    getComponentLoadingStrategy,
    shouldBundleSplit: performanceScore > 60,
    shouldUseWebP: performanceScore > 70,
    shouldPrefetch: performanceScore > 80 && !isSlowConnection
  }
}

// Hook for resource prioritization
export function useResourcePriority() {
  const { isSlowConnection, performanceScore } = usePerformance()

  const getPriority = (resourceType: 'critical' | 'important' | 'optional') => {
    if (isSlowConnection || performanceScore < 50) {
      return resourceType === 'critical' ? 'high' : 'low'
    }
    
    if (performanceScore > 80) {
      return resourceType === 'optional' ? 'low' : 'high'
    }
    
    return resourceType === 'critical' ? 'high' : 'medium'
  }

  return {
    getPriority,
    shouldLoadCriticalOnly: isSlowConnection && performanceScore < 40,
    shouldDeferNonCritical: isSlowConnection || performanceScore < 60,
    maxConcurrentRequests: isSlowConnection ? 2 : performanceScore > 80 ? 6 : 4
  }
}
