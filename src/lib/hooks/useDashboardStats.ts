/**
 * Custom hook for fetching dashboard statistics with React Query
 * Provides caching, loading states, and error handling
 */

import { useQuery, useQueryClient } from '@tanstack/react-query'
import dashboardStatsService from '@/lib/services/dashboard-stats-service'
import statisticsService from '@/lib/services/statistics-service'
import { logger } from '@/lib/logger'

export const STATS_QUERY_KEYS = {
  teacherStats: (teacherId: string) => ['stats', 'teacher', teacherId] as const,
  classStats: (teacherId: string) => ['stats', 'classes', teacherId] as const,
  performance: (teacherId: string, timeRange: string) => ['stats', 'performance', teacherId, timeRange] as const,
  ageGroups: (teacherId: string) => ['stats', 'ageGroups', teacherId] as const,
  levels: (teacherId: string) => ['stats', 'levels', teacherId] as const,
  trends: (teacherId: string, months: number) => ['stats', 'trends', teacherId, months] as const,
}

/**
 * Hook to fetch teacher dashboard statistics
 */
export function useTeacherStats(teacherId: string) {
  return useQuery({
    queryKey: STATS_QUERY_KEYS.teacherStats(teacherId),
    queryFn: async () => {
      logger.log('Fetching teacher stats:', teacherId)
      const result = await dashboardStatsService.getTeacherStats(teacherId)
      
      if (result.error) {
        const errorMsg = typeof result.error === 'object' && result.error !== null && 'error' in result.error
          ? (result.error as any).error
          : 'Failed to fetch teacher stats'
        throw new Error(errorMsg)
      }
      
      return result.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
    enabled: !!teacherId,
  })
}

/**
 * Hook to fetch class statistics
 */
export function useClassStats(teacherId: string) {
  return useQuery({
    queryKey: STATS_QUERY_KEYS.classStats(teacherId),
    queryFn: async () => {
      logger.log('Fetching class stats:', teacherId)
      const result = await dashboardStatsService.getClassStatistics(teacherId)
      
      if (result.error) {
        const errorMsg = typeof result.error === 'object' && result.error !== null && 'message' in result.error
          ? (result.error as any).message
          : 'Failed to fetch class stats'
        throw new Error(errorMsg)
      }
      
      return result.data
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!teacherId,
  })
}

/**
 * Hook to fetch performance metrics
 */
export function usePerformanceMetrics(
  teacherId: string,
  timeRange: 'week' | 'month' | 'quarter' | 'year' = 'month'
) {
  return useQuery({
    queryKey: STATS_QUERY_KEYS.performance(teacherId, timeRange),
    queryFn: async () => {
      logger.log('Fetching performance metrics:', { teacherId, timeRange })
      const result = await statisticsService.getPerformanceMetrics(teacherId, timeRange)
      
      if (result.error) {
        throw new Error(result.error.message || 'Failed to fetch performance metrics')
      }
      
      return result.data
    },
    staleTime: 10 * 60 * 1000, // 10 minutes (analytics don't change frequently)
    gcTime: 30 * 60 * 1000, // 30 minutes
    enabled: !!teacherId,
  })
}

/**
 * Hook to fetch age group analytics
 */
export function useAgeGroupAnalytics(teacherId: string) {
  return useQuery({
    queryKey: STATS_QUERY_KEYS.ageGroups(teacherId),
    queryFn: async () => {
      logger.log('Fetching age group analytics:', teacherId)
      const result = await statisticsService.getAgeGroupAnalytics(teacherId)
      
      if (result.error) {
        throw new Error(result.error.message || 'Failed to fetch age group analytics')
      }
      
      return result.data || []
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000,
    enabled: !!teacherId,
  })
}

/**
 * Hook to fetch level analytics
 */
export function useLevelAnalytics(teacherId: string) {
  return useQuery({
    queryKey: STATS_QUERY_KEYS.levels(teacherId),
    queryFn: async () => {
      logger.log('Fetching level analytics:', teacherId)
      const result = await statisticsService.getLevelAnalytics(teacherId)
      
      if (result.error) {
        throw new Error(result.error.message || 'Failed to fetch level analytics')
      }
      
      return result.data || []
    },
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    enabled: !!teacherId,
  })
}

/**
 * Hook to fetch monthly trends
 */
export function useMonthlyTrends(teacherId: string, months: number = 5) {
  return useQuery({
    queryKey: STATS_QUERY_KEYS.trends(teacherId, months),
    queryFn: async () => {
      logger.log('Fetching monthly trends:', { teacherId, months })
      const result = await statisticsService.getMonthlyTrends(teacherId, months)
      
      if (result.error) {
        throw new Error(result.error.message || 'Failed to fetch monthly trends')
      }
      
      return result.data || []
    },
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    enabled: !!teacherId,
  })
}

/**
 * Hook to invalidate stats queries (useful after data changes)
 */
export function useInvalidateStats() {
  const queryClient = useQueryClient()
  
  return {
    invalidateAll: (teacherId: string) => {
      queryClient.invalidateQueries({ queryKey: ['stats', 'teacher', teacherId] })
      queryClient.invalidateQueries({ queryKey: ['stats', 'classes', teacherId] })
      queryClient.invalidateQueries({ queryKey: ['stats', 'performance', teacherId] })
      queryClient.invalidateQueries({ queryKey: ['stats', 'ageGroups', teacherId] })
      queryClient.invalidateQueries({ queryKey: ['stats', 'levels', teacherId] })
      queryClient.invalidateQueries({ queryKey: ['stats', 'trends', teacherId] })
    },
    invalidateTeacherStats: (teacherId: string) => {
      queryClient.invalidateQueries({ queryKey: STATS_QUERY_KEYS.teacherStats(teacherId) })
    },
    invalidateClassStats: (teacherId: string) => {
      queryClient.invalidateQueries({ queryKey: STATS_QUERY_KEYS.classStats(teacherId) })
    },
  }
}
