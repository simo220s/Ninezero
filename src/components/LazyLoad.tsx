import { useState, useEffect, useRef, type ReactNode } from 'react'

interface LazyLoadProps {
  children: ReactNode
  fallback?: ReactNode
  rootMargin?: string
  threshold?: number
  once?: boolean
  className?: string
}

export default function LazyLoad({
  children,
  fallback = null,
  rootMargin = '50px',
  threshold = 0.1,
  once = true,
  className = ''
}: LazyLoadProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (once) {
            setHasLoaded(true)
            observer.unobserve(element)
          }
        } else if (!once) {
          setIsVisible(false)
        }
      },
      {
        rootMargin,
        threshold
      }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [rootMargin, threshold, once])

  const shouldRender = hasLoaded || isVisible

  return (
    <div ref={elementRef} className={className}>
      {shouldRender ? children : fallback}
    </div>
  )
}

// Specialized lazy loading components
export function LazySection({ 
  children, 
  className = '',
  ...props 
}: Omit<LazyLoadProps, 'fallback'>) {
  return (
    <LazyLoad
      fallback={
        <div className={`min-h-[200px] bg-gray-50 animate-pulse rounded-lg ${className}`} />
      }
      className={className}
      {...props}
    >
      {children}
    </LazyLoad>
  )
}

export function LazyImage({ 
  src, 
  alt, 
  className = '',
  ...props 
}: { 
  src: string
  alt: string
  className?: string
} & Omit<LazyLoadProps, 'children' | 'fallback'>) {
  return (
    <LazyLoad
      fallback={
        <div className={`bg-gray-200 animate-pulse rounded ${className}`}>
          <div className="flex items-center justify-center h-full">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      }
      className={className}
      {...props}
    >
      <img src={src} alt={alt} className={className} loading="lazy" />
    </LazyLoad>
  )
}
