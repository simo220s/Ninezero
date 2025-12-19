import { useState } from 'react'
import { useLanguage } from '@/hooks/useRTL'
import { useAdaptiveLoading } from '@/hooks/useOptimizedLoading'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: boolean
  sizes?: string
  placeholder?: string
  onLoad?: () => void
  onError?: () => void
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  loading = 'lazy',
  priority = false,
  sizes,
  placeholder = '/images/placeholder.jpg',
  onLoad,
  onError
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const { language } = useLanguage()
  const { getImageLoadingStrategy } = useAdaptiveLoading()
  
  // Get adaptive loading strategy
  const adaptiveStrategy = getImageLoadingStrategy()
  const finalLoading = priority ? 'eager' : (adaptiveStrategy.loading || loading)
  const shouldShowPlaceholder = adaptiveStrategy.placeholder && !isLoaded && !hasError

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    setHasError(true)
    onError?.()
  }

  // Generate responsive image sources
  const generateSrcSet = (baseSrc: string) => {
    const extension = baseSrc.split('.').pop()
    const baseName = baseSrc.replace(`.${extension}`, '')
    
    return [
      `${baseName}-400w.${extension} 400w`,
      `${baseName}-800w.${extension} 800w`,
      `${baseName}-1200w.${extension} 1200w`,
      `${baseName}-1600w.${extension} 1600w`
    ].join(', ')
  }

  const defaultSizes = sizes || '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Loading placeholder */}
      {shouldShowPlaceholder && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center"
          style={{ width, height }}
        >
          <svg 
            className="w-8 h-8 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
            />
          </svg>
        </div>
      )}

      {/* Error fallback */}
      {hasError && (
        <div 
          className="absolute inset-0 bg-gray-100 flex items-center justify-center text-gray-500"
          style={{ width, height }}
        >
          <div className="text-center">
            <svg 
              className="w-8 h-8 mx-auto mb-2 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
              />
            </svg>
            <p className="text-xs">
              {language === 'ar' ? 'فشل تحميل الصورة' : 'Image failed to load'}
            </p>
          </div>
        </div>
      )}

      {/* Main image */}
      <img
        src={hasError ? placeholder : src}
        alt={alt}
        width={width}
        height={height}
        loading={finalLoading}
        decoding="async"
        srcSet={!hasError ? generateSrcSet(src) : undefined}
        sizes={defaultSizes}
        onLoad={handleLoad}
        onError={handleError}
        className={`
          transition-opacity duration-300
          ${isLoaded ? 'opacity-100' : 'opacity-0'}
          ${className}
        `}
        style={{
          maxWidth: '100%',
          height: 'auto',
          ...(width && height && { aspectRatio: `${width}/${height}` })
        }}
      />
    </div>
  )
}

// Specific image components with predefined alt text
export function TeacherAhmadImage({ className = '', ...props }: Omit<OptimizedImageProps, 'src' | 'alt'>) {
  const { language } = useLanguage()
  
  return (
    <OptimizedImage
      src="/images/teacher-ahmad-hero.jpg"
      alt={language === 'ar' 
        ? 'الأستاذ أحمد، معلم اللغة الإنجليزية المعتمد من جامعة أريزونا، يبتسم بثقة في بيئة تعليمية احترافية'
        : 'Teacher Ahmad, TESOL-certified English teacher from University of Arizona, smiling confidently in a professional educational setting'
      }
      className={className}
      priority
      {...props}
    />
  )
}

export function LogoImage({ className = '', ...props }: Omit<OptimizedImageProps, 'src' | 'alt'>) {
  const { language } = useLanguage()
  
  return (
    <OptimizedImage
      src="/images/logo.png"
      alt={language === 'ar' 
        ? 'شعار نادي السعودية للغة الإنجليزية'
        : 'Saudi English Club logo'
      }
      className={className}
      priority
      {...props}
    />
  )
}

export function TestimonialImage({ 
  testimonialNumber, 
  parentName, 
  className = '', 
  ...props 
}: Omit<OptimizedImageProps, 'src' | 'alt'> & { 
  testimonialNumber: number
  parentName: string 
}) {
  const { language } = useLanguage()
  
  return (
    <OptimizedImage
      src={`/images/testimonial-${testimonialNumber}.jpg`}
      alt={language === 'ar' 
        ? `صورة شخصية لولي الأمر ${parentName}`
        : `Profile photo of parent ${parentName}`
      }
      className={className}
      loading="lazy"
      {...props}
    />
  )
}
