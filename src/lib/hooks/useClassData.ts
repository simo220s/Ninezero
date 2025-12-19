/**
 * Custom hook for fetching class/session data with React Query
 * Provides caching, loading states, and error handling
 */

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getTeacherClasses, getStudentClasses } from '@/lib/database'
import { logger } from '@/lib/logger'

export const CLASS_QUERY_KEYS = {
  teacher: (teacherId: string) => ['classes', 'teacher', teacherId] as const,
  student: (studentId: string) => ['classes', 'student', studentId] as const,
  upcoming: (userId: string, role: 'teacher' | 'student') => ['classes', 'upcoming', role, userId] as const,
  today: (userId: string, role: 'teacher' | 'student') => ['classes', 'today', role, userId] as const,
}

/**
 * Hook to fetch all classes for a teacher
 */
export function useTeacherClasses(teacherId: string) {
  return useQuery({
    queryKey: CLASS_QUERY_KEYS.teacher(teacherId),
    queryFn: async () => {
      logger.log('Fetching classes for teacher:', teacherId)
      const result = await getTeacherClasses(teacherId)
      
      if (result.error) {
        throw new Error(result.error.message || 'Failed to fetch classes')
      }
      
      // Transform to expected format
      const classes = (result.data || []).map((cls: any) => ({
        id: cls.id,
        date: cls.date,
        time: cls.time,
        duration: cls.duration,
        meetingLink: cls.meeting_link,
        status: cls.status,
        studentName: cls.student 
          ? `${cls.student.first_name} ${cls.student.last_name}` 
          : 'غير محدد',
        studentId: cls.student_id,
      }))
      
      return classes
    },
    staleTime: 2 * 60 * 1000, // 2 minutes (classes change frequently)
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!teacherId,
  })
}

/**
 * Hook to fetch all classes for a student
 */
export function useStudentClasses(studentId: string) {
  return useQuery({
    queryKey: CLASS_QUERY_KEYS.student(studentId),
    queryFn: async () => {
      logger.log('Fetching classes for student:', studentId)
      const result = await getStudentClasses(studentId)
      
      if (result.error) {
        throw new Error(result.error.message || 'Failed to fetch classes')
      }
      
      // Transform to expected format
      const classes = (result.data || []).map((session: any) => ({
        id: session.id,
        date: session.date,
        time: session.time,
        duration: session.duration,
        meetingLink: session.meeting_link,
        status: session.status as 'scheduled' | 'completed' | 'cancelled' | 'no-show',
      }))
      
      return classes
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled: !!studentId,
  })
}

/**
 * Hook to fetch upcoming classes
 */
export function useUpcomingClasses(userId: string, role: 'teacher' | 'student') {
  const queryKey = CLASS_QUERY_KEYS.upcoming(userId, role)
  const fetchFn = role === 'teacher' ? getTeacherClasses : getStudentClasses
  
  return useQuery({
    queryKey,
    queryFn: async () => {
      const result = await fetchFn(userId)
      
      if (result.error) {
        throw new Error(result.error.message || 'Failed to fetch upcoming classes')
      }
      
      const today = new Date().toISOString().split('T')[0]
      
      // Filter for upcoming scheduled classes
      const upcoming = (result.data || [])
        .filter((cls: any) => cls.status === 'scheduled' && cls.date >= today)
        .sort((a: any, b: any) => {
          const dateCompare = a.date.localeCompare(b.date)
          if (dateCompare !== 0) return dateCompare
          return a.time.localeCompare(b.time)
        })
      
      return upcoming
    },
    staleTime: 1 * 60 * 1000, // 1 minute (very fresh for upcoming classes)
    gcTime: 3 * 60 * 1000,
    enabled: !!userId,
  })
}

/**
 * Hook to fetch today's classes
 */
export function useTodayClasses(userId: string, role: 'teacher' | 'student') {
  const queryKey = CLASS_QUERY_KEYS.today(userId, role)
  const fetchFn = role === 'teacher' ? getTeacherClasses : getStudentClasses
  
  return useQuery({
    queryKey,
    queryFn: async () => {
      const result = await fetchFn(userId)
      
      if (result.error) {
        throw new Error(result.error.message || 'Failed to fetch today\'s classes')
      }
      
      const today = new Date().toISOString().split('T')[0]
      
      // Filter for today's scheduled classes
      const todayClasses = (result.data || [])
        .filter((cls: any) => cls.status === 'scheduled' && cls.date === today)
        .sort((a: any, b: any) => a.time.localeCompare(b.time))
      
      return todayClasses
    },
    staleTime: 30 * 1000, // 30 seconds (very fresh for today's schedule)
    gcTime: 2 * 60 * 1000,
    enabled: !!userId,
    refetchInterval: 60 * 1000, // Refetch every minute
  })
}

/**
 * Hook to invalidate class queries (useful after mutations)
 */
export function useInvalidateClasses() {
  const queryClient = useQueryClient()
  
  return {
    invalidateTeacher: (teacherId: string) => {
      queryClient.invalidateQueries({ queryKey: CLASS_QUERY_KEYS.teacher(teacherId) })
      queryClient.invalidateQueries({ queryKey: CLASS_QUERY_KEYS.upcoming(teacherId, 'teacher') })
      queryClient.invalidateQueries({ queryKey: CLASS_QUERY_KEYS.today(teacherId, 'teacher') })
    },
    invalidateStudent: (studentId: string) => {
      queryClient.invalidateQueries({ queryKey: CLASS_QUERY_KEYS.student(studentId) })
      queryClient.invalidateQueries({ queryKey: CLASS_QUERY_KEYS.upcoming(studentId, 'student') })
      queryClient.invalidateQueries({ queryKey: CLASS_QUERY_KEYS.today(studentId, 'student') })
    },
    invalidateAll: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] })
    },
  }
}
