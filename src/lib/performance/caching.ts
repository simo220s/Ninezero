/**
 * Caching Utilities for Performance Optimization
 * 
 * Implements in-memory and localStorage caching for frequently
 * accessed data like student lists and class schedules
 */

import { logger } from '../logger'

export interface CacheConfig {
  ttl?: number // Time to live in milliseconds
  storage?: 'memory' | 'localStorage'
}

export interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

/**
 * In-memory cache implementation
 */
class MemoryCache {
  private cache: Map<string, CacheEntry<any>> = new Map()

  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }

    const isExpired = Date.now() - entry.timestamp > entry.ttl
    
    if (isExpired) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  has(key: string): boolean {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return false
    }

    const isExpired = Date.now() - entry.timestamp > entry.ttl
    
    if (isExpired) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }
}

/**
 * LocalStorage cache implementation
 */
class LocalStorageCache {
  private prefix = 'lms_cache_'

  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl,
      }
      localStorage.setItem(this.prefix + key, JSON.stringify(entry))
    } catch (error) {
      logger.error('LocalStorage cache set error:', error)
    }
  }

  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(this.prefix + key)
      
      if (!item) {
        return null
      }

      const entry: CacheEntry<T> = JSON.parse(item)
      const isExpired = Date.now() - entry.timestamp > entry.ttl
      
      if (isExpired) {
        this.delete(key)
        return null
      }

      return entry.data
    } catch (error) {
      logger.error('LocalStorage cache get error:', error)
      return null
    }
  }

  has(key: string): boolean {
    try {
      const item = localStorage.getItem(this.prefix + key)
      
      if (!item) {
        return false
      }

      const entry: CacheEntry<any> = JSON.parse(item)
      const isExpired = Date.now() - entry.timestamp > entry.ttl
      
      if (isExpired) {
        this.delete(key)
        return false
      }

      return true
    } catch (error) {
      return false
    }
  }

  delete(key: string): void {
    localStorage.removeItem(this.prefix + key)
  }

  clear(): void {
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key)
      }
    })
  }
}

/**
 * Unified cache manager
 */
class CacheManager {
  private memoryCache = new MemoryCache()
  private localStorageCache = new LocalStorageCache()

  set<T>(
    key: string,
    data: T,
    config: CacheConfig = {}
  ): void {
    const { ttl = 5 * 60 * 1000, storage = 'memory' } = config

    if (storage === 'localStorage') {
      this.localStorageCache.set(key, data, ttl)
    } else {
      this.memoryCache.set(key, data, ttl)
    }

    logger.log(`Cache set: ${key} (${storage})`)
  }

  get<T>(key: string, storage: 'memory' | 'localStorage' = 'memory'): T | null {
    const data = storage === 'localStorage'
      ? this.localStorageCache.get<T>(key)
      : this.memoryCache.get<T>(key)

    if (data) {
      logger.log(`Cache hit: ${key} (${storage})`)
    } else {
      logger.log(`Cache miss: ${key} (${storage})`)
    }

    return data
  }

  has(key: string, storage: 'memory' | 'localStorage' = 'memory'): boolean {
    return storage === 'localStorage'
      ? this.localStorageCache.has(key)
      : this.memoryCache.has(key)
  }

  delete(key: string, storage?: 'memory' | 'localStorage'): void {
    if (!storage || storage === 'memory') {
      this.memoryCache.delete(key)
    }
    if (!storage || storage === 'localStorage') {
      this.localStorageCache.delete(key)
    }
    logger.log(`Cache deleted: ${key}`)
  }

  clear(storage?: 'memory' | 'localStorage'): void {
    if (!storage || storage === 'memory') {
      this.memoryCache.clear()
    }
    if (!storage || storage === 'localStorage') {
      this.localStorageCache.clear()
    }
    logger.log('Cache cleared')
  }

  getStats() {
    return {
      memorySize: this.memoryCache.size(),
    }
  }
}

// Export singleton instance
export const cache = new CacheManager()

/**
 * Hook for cached data fetching
 */
export function useCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  config: CacheConfig = {}
) {
  const { ttl = 5 * 60 * 1000, storage = 'memory' } = config

  return async (): Promise<T> => {
    // Check cache first
    const cached = cache.get<T>(key, storage)
    if (cached !== null) {
      return cached
    }

    // Fetch fresh data
    const data = await fetcher()
    
    // Store in cache
    cache.set(key, data, { ttl, storage })
    
    return data
  }
}

/**
 * Predefined cache keys for common data
 */
export const CacheKeys = {
  STUDENTS_LIST: 'students_list',
  CLASSES_LIST: 'classes_list',
  TEACHER_STATS: 'teacher_stats',
  STUDENT_DETAILS: (id: string) => `student_${id}`,
  CLASS_DETAILS: (id: string) => `class_${id}`,
  FINANCIAL_DATA: 'financial_data',
  REVIEWS_LIST: 'reviews_list',
}

/**
 * Cache invalidation helpers
 */
export const invalidateCache = {
  students: () => {
    cache.delete(CacheKeys.STUDENTS_LIST)
  },
  classes: () => {
    cache.delete(CacheKeys.CLASSES_LIST)
  },
  teacherStats: () => {
    cache.delete(CacheKeys.TEACHER_STATS)
  },
  all: () => {
    cache.clear()
  },
}
