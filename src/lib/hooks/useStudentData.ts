/**
 * Custom hook for fetching student data with React Query
 * Provides caching, loading states, and error handling
 */

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { studentService } from '@/lib/services/student-service'
import { logger } from '@/lib/logger'

export const STUDENT_QUERY_KEYS = {
  all: (teacherId: string) => ['students', teacherId] as const,
  byId: (studentId: string) => ['students', 'detail', studentId] as const,
  stats: (teacherId: string) => ['students', 'stats', teacherId] as const,
}

/**
 * Hook to fetch all students for a teacher
 */
export function useStudentData(teacherId: string) {
  return useQuery({
    queryKey: STUDENT_QUERY_KEYS.all(teacherId),
    queryFn: async () => {
      logger.log('Fetching students for teacher:', teacherId)
      const result = await studentService.getTeacherStudents(teacherId)
      
      if (result.error) {
        throw new Error(result.error.message || 'Failed to fetch students')
      }
      
      return result.data || []
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    enabled: !!teacherId,
  })
}

/**
 * Hook to fetch a single student by ID
 */
export function useStudent(studentId: string) {
  return useQuery({
    queryKey: STUDENT_QUERY_KEYS.byId(studentId),
    queryFn: async () => {
      logger.log('Fetching student:', studentId)
      const result = await studentService.getStudentById(studentId)
      
      if (result.error) {
        throw new Error(result.error.message || 'Failed to fetch student')
      }
      
      return result.data
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!studentId,
  })
}

/**
 * Hook to fetch student statistics
 */
export function useStudentStats(teacherId: string) {
  return useQuery({
    queryKey: STUDENT_QUERY_KEYS.stats(teacherId),
    queryFn: async () => {
      logger.log('Fetching student stats for teacher:', teacherId)
      const result = await studentService.getStudentStats(teacherId)
      
      if (result.error) {
        throw new Error(result.error.message || 'Failed to fetch student stats')
      }
      
      return result.data
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!teacherId,
  })
}

/**
 * Hook to invalidate student queries (useful after mutations)
 */
export function useInvalidateStudents() {
  const queryClient = useQueryClient()
  
  return {
    invalidateAll: (teacherId: string) => {
      queryClient.invalidateQueries({ queryKey: STUDENT_QUERY_KEYS.all(teacherId) })
      queryClient.invalidateQueries({ queryKey: STUDENT_QUERY_KEYS.stats(teacherId) })
    },
    invalidateStudent: (studentId: string) => {
      queryClient.invalidateQueries({ queryKey: STUDENT_QUERY_KEYS.byId(studentId) })
    },
  }
}
