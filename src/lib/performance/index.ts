/**
 * Performance Optimization Module
 * 
 * Central export for all performance optimization utilities
 */

// Caching
export {
  cache,
  useCachedData,
  CacheKeys,
  invalidateCache,
  type CacheConfig,
  type CacheEntry,
} from './caching'

// Lazy Loading
export {
  useLazyLoad,
  useInfiniteScroll,
  useVirtualScroll,
  useDebounce,
  throttle,
  type PaginationConfig,
  type LazyLoadResult,
  type VirtualScrollConfig,
} from './lazy-loading'

// Image Optimization
export {
  compressImage,
  generateSrcSet,
  getOptimizedImageUrl,
  createLazyImageObserver,
  preloadImage,
  preloadImages,
  convertToWebP,
  getImageDimensions,
  validateImageFile,
  createThumbnail,
  uploadImageWithProgress,
  type ImageOptimizationConfig,
} from './image-optimization'

// Query Optimization
export {
  OptimizedStudentQueries,
  OptimizedClassQueries,
  OptimizedFinancialQueries,
  BatchOperations,
  withCache,
} from './query-optimization'

// Mobile Optimization
export {
  Breakpoints,
  useDeviceType,
  useIsMobile,
  useIsTablet,
  useIsTouchDevice,
  useResponsiveValue,
  useWindowSize,
  usePrefersReducedMotion,
  useNetworkStatus,
  getResponsiveColumns,
  getResponsiveFontSize,
  getResponsiveSpacing,
  TouchTargetSize,
  Viewport,
  MobilePerformance,
  useOrientation,
  useSafeAreaInsets,
  type DeviceType,
} from './mobile-optimization'
