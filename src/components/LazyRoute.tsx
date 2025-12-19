import { Suspense, type ComponentType, type ReactNode, lazy } from 'react'
import { Spinner } from '@/components/ui/spinner'

// Removed unused interface

// Enhanced loading fallback with better UX
function DefaultLoadingFallback() {
  return (
    <div className="min-h-screen bg-bg-light flex items-center justify-center">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-text-secondary arabic-text">
          جاري التحميل...
        </p>
      </div>
    </div>
  )
}

// Skeleton loading fallbacks for specific routes
function DashboardLoadingFallback() {
  return (
    <div className="min-h-screen bg-bg-light">
      <div className="animate-pulse">
        {/* Header skeleton */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-96"></div>
          </div>
        </div>
        
        {/* Content skeleton */}
        <div className="max-w-7xl mx-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg border">
                <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg border">
                <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function LandingPageLoadingFallback() {
  return (
    <div className="min-h-screen bg-white">
      <div className="animate-pulse">
        {/* Hero skeleton */}
        <div className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="space-y-4 mb-8">
                  <div className="h-8 bg-gray-200 rounded"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
                <div className="flex gap-4">
                  <div className="h-12 bg-gray-200 rounded w-32"></div>
                  <div className="h-12 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
              <div className="h-96 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
        
        {/* Stats skeleton */}
        <div className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="text-center">
                  <div className="h-12 bg-gray-200 rounded w-16 mx-auto mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-24 mx-auto"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// HOC for creating lazy routes with better error boundaries
export function createLazyRoute<T extends ComponentType<unknown>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: ComponentType
) {
  const LazyComponent = lazy(importFn)
  const FallbackComponent = fallback || DefaultLoadingFallback

  return function LazyRoute(props: Parameters<T>[0]) {
    return (
      <Suspense fallback={<FallbackComponent />}>
        <LazyComponent {...props} />
      </Suspense>
    )
  }
}

// Specialized lazy route creators with appropriate skeletons
export function createLandingPageRoute<T extends ComponentType<unknown>>(
  importFn: () => Promise<{ default: T }>
) {
  return createLazyRoute(importFn, LandingPageLoadingFallback)
}

export function createDashboardRoute<T extends ComponentType<unknown>>(
  importFn: () => Promise<{ default: T }>
) {
  return createLazyRoute(importFn, DashboardLoadingFallback)
}

export function createAuthRoute<T extends ComponentType<unknown>>(
  importFn: () => Promise<{ default: T }>
) {
  return createLazyRoute(importFn, DefaultLoadingFallback)
}

// Preload function for routes
export function preloadRoute(importFn: () => Promise<{ default: ComponentType<unknown> }>) {
  // Preload the component
  importFn().catch(() => {
    // Silently fail - the component will be loaded when needed
  })
}

// Hook for preloading routes on hover/focus
export function useRoutePreload() {
  const preloadOnHover = (importFn: () => Promise<{ default: ComponentType<unknown> }>) => {
    return {
      onMouseEnter: () => preloadRoute(importFn),
      onFocus: () => preloadRoute(importFn)
    }
  }

  return { preloadOnHover }
}

// Component for progressive enhancement
export function ProgressiveEnhancement({ 
  children, 
  fallback 
}: { 
  children: ReactNode
  fallback?: ReactNode 
}) {
  return (
    <Suspense fallback={fallback || <DefaultLoadingFallback />}>
      {children}
    </Suspense>
  )
}
