/**
 * Image Optimization Utilities
 * 
 * Handles image compression, lazy loading, and responsive images
 * for student photos and teaching materials
 */

import { logger } from '../logger'

export interface ImageOptimizationConfig {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: 'jpeg' | 'png' | 'webp'
}

/**
 * Compress and resize image file
 */
export async function compressImage(
  file: File,
  config: ImageOptimizationConfig = {}
): Promise<Blob> {
  const {
    maxWidth = 800,
    maxHeight = 800,
    quality = 0.8,
    format = 'jpeg',
  } = config

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const img = new Image()
      
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let { width, height } = img

        // Calculate new dimensions
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width *= ratio
          height *= ratio
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Failed to get canvas context'))
          return
        }

        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Failed to compress image'))
            }
          },
          `image/${format}`,
          quality
        )
      }

      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = e.target?.result as string
    }

    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

/**
 * Generate responsive image srcset
 */
export function generateSrcSet(baseUrl: string, sizes: number[]): string {
  return sizes
    .map(size => `${baseUrl}?w=${size} ${size}w`)
    .join(', ')
}

/**
 * Get optimized image URL with transformations
 */
export function getOptimizedImageUrl(
  url: string,
  options: {
    width?: number
    height?: number
    quality?: number
    format?: 'jpeg' | 'png' | 'webp'
  } = {}
): string {
  if (!url) return ''

  // If using Supabase Storage or similar service with transformation support
  const params = new URLSearchParams()
  
  if (options.width) params.append('w', options.width.toString())
  if (options.height) params.append('h', options.height.toString())
  if (options.quality) params.append('q', options.quality.toString())
  if (options.format) params.append('f', options.format)

  const queryString = params.toString()
  return queryString ? `${url}?${queryString}` : url
}

/**
 * Lazy load image component helper
 */
export function createLazyImageObserver(
  callback: (entry: IntersectionObserverEntry) => void
): IntersectionObserver {
  const options = {
    root: null,
    rootMargin: '50px',
    threshold: 0.01,
  }

  return new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        callback(entry)
      }
    })
  }, options)
}

/**
 * Preload critical images
 */
export function preloadImage(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = reject
    img.src = url
  })
}

/**
 * Batch preload multiple images
 */
export async function preloadImages(urls: string[]): Promise<void> {
  try {
    await Promise.all(urls.map(url => preloadImage(url)))
    logger.log(`Preloaded ${urls.length} images`)
  } catch (error) {
    logger.error('Image preload error:', error)
  }
}

/**
 * Convert image to WebP format (if supported)
 */
export async function convertToWebP(file: File): Promise<Blob> {
  // Check WebP support
  const canvas = document.createElement('canvas')
  const supportsWebP = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0

  if (!supportsWebP) {
    // Fallback to JPEG
    return compressImage(file, { format: 'jpeg' })
  }

  return compressImage(file, { format: 'webp', quality: 0.85 })
}

/**
 * Get image dimensions without loading full image
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const img = new Image()
      
      img.onload = () => {
        resolve({ width: img.width, height: img.height })
      }
      
      img.onerror = reject
      img.src = e.target?.result as string
    }
    
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Validate image file
 */
export function validateImageFile(
  file: File,
  options: {
    maxSize?: number // in bytes
    allowedTypes?: string[]
    maxWidth?: number
    maxHeight?: number
  } = {}
): Promise<{ valid: boolean; error?: string }> {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
    maxWidth = 4000,
    maxHeight = 4000,
  } = options

  return new Promise(async (resolve) => {
    // Check file type
    if (!allowedTypes.includes(file.type)) {
      resolve({
        valid: false,
        error: `نوع الملف غير مدعوم. الأنواع المسموحة: ${allowedTypes.join(', ')}`,
      })
      return
    }

    // Check file size
    if (file.size > maxSize) {
      resolve({
        valid: false,
        error: `حجم الملف كبير جداً. الحد الأقصى: ${(maxSize / 1024 / 1024).toFixed(1)} MB`,
      })
      return
    }

    // Check dimensions
    try {
      const { width, height } = await getImageDimensions(file)
      
      if (width > maxWidth || height > maxHeight) {
        resolve({
          valid: false,
          error: `أبعاد الصورة كبيرة جداً. الحد الأقصى: ${maxWidth}x${maxHeight}`,
        })
        return
      }

      resolve({ valid: true })
    } catch (error) {
      resolve({
        valid: false,
        error: 'فشل التحقق من الصورة',
      })
    }
  })
}

/**
 * Create thumbnail from image
 */
export async function createThumbnail(
  file: File,
  size: number = 150
): Promise<Blob> {
  return compressImage(file, {
    maxWidth: size,
    maxHeight: size,
    quality: 0.7,
    format: 'jpeg',
  })
}

/**
 * Image upload with progress tracking
 */
export async function uploadImageWithProgress(
  file: File,
  uploadFn: (file: File) => Promise<string>,
  onProgress?: (progress: number) => void
): Promise<string> {
  // Simulate progress for compression
  if (onProgress) onProgress(10)

  // Compress image
  const compressed = await compressImage(file)
  if (onProgress) onProgress(30)

  // Convert to File
  const compressedFile = new File([compressed], file.name, {
    type: compressed.type,
  })

  if (onProgress) onProgress(50)

  // Upload
  const url = await uploadFn(compressedFile)
  if (onProgress) onProgress(100)

  return url
}
