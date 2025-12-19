import { useAuth } from '@/lib/auth-context'

const TEACHER_EMAIL = 'selem.vet@gmail.com'

export function useUserRole() {
  const { user } = useAuth()
  
  const role = user?.email === TEACHER_EMAIL ? 'teacher' : 'student'
  const isTeacher = role === 'teacher'
  const isStudent = role === 'student'
  
  return {
    role,
    isTeacher,
    isStudent,
  }
}
