/**
 * Lazy Loading Utilities for Performance Optimization
 * 
 * Implements pagination and virtual scrolling for large lists
 * of students and classes to improve performance
 */

import { useState, useEffect, useCallback, useRef } from 'react'

export interface PaginationConfig {
  pageSize: number
  initialPage?: number
}

export interface LazyLoadResult<T> {
  items: T[]
  hasMore: boolean
  isLoading: boolean
  loadMore: () => void
  reset: () => void
  currentPage: number
  totalItems: number
}

/**
 * Hook for implementing lazy loading with pagination
 */
export function useLazyLoad<T>(
  allItems: T[],
  config: PaginationConfig = { pageSize: 20, initialPage: 1 }
): LazyLoadResult<T> {
  const [currentPage, setCurrentPage] = useState(config.initialPage || 1)
  const [isLoading, setIsLoading] = useState(false)
  const { pageSize } = config

  const totalPages = Math.ceil(allItems.length / pageSize)
  const hasMore = currentPage < totalPages

  // Get items for current page
  const items = allItems.slice(0, currentPage * pageSize)

  const loadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      setIsLoading(true)
      // Simulate async loading
      setTimeout(() => {
        setCurrentPage(prev => prev + 1)
        setIsLoading(false)
      }, 100)
    }
  }, [hasMore, isLoading])

  const reset = useCallback(() => {
    setCurrentPage(config.initialPage || 1)
  }, [config.initialPage])

  return {
    items,
    hasMore,
    isLoading,
    loadMore,
    reset,
    currentPage,
    totalItems: allItems.length,
  }
}

/**
 * Hook for implementing infinite scroll
 */
export function useInfiniteScroll(
  callback: () => void,
  hasMore: boolean,
  isLoading: boolean
) {
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (isLoading || !hasMore) return

    const options = {
      root: null,
      rootMargin: '100px',
      threshold: 0.1,
    }

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        callback()
      }
    }, options)

    const currentRef = loadMoreRef.current
    if (currentRef) {
      observerRef.current.observe(currentRef)
    }

    return () => {
      if (observerRef.current && currentRef) {
        observerRef.current.unobserve(currentRef)
      }
    }
  }, [callback, hasMore, isLoading])

  return loadMoreRef
}

/**
 * Virtual scrolling for very large lists
 */
export interface VirtualScrollConfig {
  itemHeight: number
  containerHeight: number
  overscan?: number
}

export function useVirtualScroll<T>(
  items: T[],
  config: VirtualScrollConfig
) {
  const [scrollTop, setScrollTop] = useState(0)
  const { itemHeight, containerHeight, overscan = 3 } = config

  const totalHeight = items.length * itemHeight
  const visibleCount = Math.ceil(containerHeight / itemHeight)
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(
    items.length,
    startIndex + visibleCount + overscan * 2
  )

  const visibleItems = items.slice(startIndex, endIndex)
  const offsetY = startIndex * itemHeight

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    startIndex,
    endIndex,
  }
}

/**
 * Debounce hook for search inputs
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Throttle function for scroll events
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return function(this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}
