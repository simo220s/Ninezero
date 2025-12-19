import { useLanguage } from '@/hooks/useRTL'

interface SkeletonLoaderProps {
  className?: string
  variant?: 'text' | 'card' | 'avatar' | 'button' | 'image'
  lines?: number
  width?: string
  height?: string
}

export default function SkeletonLoader({
  className = '',
  variant = 'text',
  lines = 1,
  width,
  height
}: SkeletonLoaderProps) {
  const { language } = useLanguage()

  const baseClasses = 'animate-pulse bg-gray-200 rounded'
  
  const variantClasses = {
    text: 'h-4',
    card: 'h-48',
    avatar: 'h-12 w-12 rounded-full',
    button: 'h-10 w-24',
    image: 'h-32 w-full'
  }

  const skeletonClass = `${baseClasses} ${variantClasses[variant]} ${className}`

  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={skeletonClass}
            style={{
              width: index === lines - 1 ? '75%' : width || '100%',
              height
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className={skeletonClass}
      style={{ width, height }}
      aria-label={language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
    />
  )
}

// Specialized skeleton components
export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`p-6 border border-gray-200 rounded-lg ${className}`}>
      <SkeletonLoader variant="avatar" className="mb-4" />
      <SkeletonLoader variant="text" lines={2} className="mb-2" />
      <SkeletonLoader variant="button" />
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-bg-light p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header skeleton */}
        <div className="mb-8">
          <SkeletonLoader variant="text" width="200px" height="32px" className="mb-2" />
          <SkeletonLoader variant="text" width="300px" />
        </div>

        {/* Stats cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {Array.from({ length: 3 }).map((_, index) => (
            <CardSkeleton key={index} />
          ))}
        </div>

        {/* Content sections skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <SkeletonLoader variant="text" width="150px" height="24px" className="mb-4" />
            <CardSkeleton />
          </div>
          <div>
            <SkeletonLoader variant="text" width="150px" height="24px" className="mb-4" />
            <CardSkeleton />
          </div>
        </div>
      </div>
    </div>
  )
}

export function LandingPageSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero section skeleton */}
      <div className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <SkeletonLoader variant="text" lines={3} className="mb-6" />
              <div className="flex gap-4">
                <SkeletonLoader variant="button" width="120px" />
                <SkeletonLoader variant="button" width="120px" />
              </div>
            </div>
            <div>
              <SkeletonLoader variant="image" height="400px" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats section skeleton */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="text-center">
                <SkeletonLoader variant="text" width="60px" height="48px" className="mx-auto mb-2" />
                <SkeletonLoader variant="text" width="100px" className="mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing section skeleton */}
      <div className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <SkeletonLoader variant="text" width="200px" height="32px" className="mx-auto mb-12" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, index) => (
              <CardSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
