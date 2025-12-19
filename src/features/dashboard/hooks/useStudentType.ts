import { useState, useEffect } from 'react'
import { getUserProfile } from '@/lib/database'
import { logger } from '@/lib/logger'

type StudentType = 'trial' | 'regular' | null

interface UseStudentTypeReturn {
  studentType: StudentType
  loading: boolean
  error: string | null
}

/**
 * Hook to determine if a user is a trial or regular student
 * @param userId - The user ID to check
 * @returns Object containing studentType, loading state, and error
 */
export function useStudentType(userId: string | undefined): UseStudentTypeReturn {
  const [studentType, setStudentType] = useState<StudentType>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    async function checkStudentType() {
      try {
        setLoading(true)
        setError(null)

        // Fetch user profile to determine student type
        const { data: profile, error: profileError } = await getUserProfile(userId!)

        if (profileError) {
          logger.error('Error fetching user profile:', profileError)
          setError('فشل في تحميل بيانات المستخدم')
          setStudentType(null)
          return
        }

        // Determine student type based on profile data
        // If is_trial is true, they are a trial student
        // Otherwise, they are a regular student
        if (profile?.is_trial === true) {
          setStudentType('trial')
        } else if (profile?.is_trial === false) {
          setStudentType('regular')
        } else {
          // Default to regular if is_trial field doesn't exist
          setStudentType('regular')
        }
      } catch (err) {
        logger.error('Error in useStudentType:', err)
        setError('حدث خطأ غير متوقع')
        setStudentType(null)
      } finally {
        setLoading(false)
      }
    }

    checkStudentType()
  }, [userId])

  return { studentType, loading, error }
}
