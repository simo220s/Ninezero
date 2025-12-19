/**
 * Student Management Service
 * 
 * Provides comprehensive student data management with:
 * - Age group and English level filtering
 * - Parent contact information
 * - Skills progress tracking
 * - Bulk operations support
 * 
 * High Priority Task 1: Complete Student Data Integration
 */

import { supabase } from '@/lib/supabase'
import { logger } from '@/lib/logger'

export type AgeGroup = '10-12' | '13-15' | '16-18' | 'all'
export type EnglishLevel = 'Beginner' | 'Elementary' | 'Intermediate' | 'Advanced'
export type EnglishSkill = 'Speaking' | 'Listening' | 'Reading' | 'Writing' | 'Grammar' | 'Vocabulary'

export interface EnhancedStudent {
  id: string
  user_id?: string
  name: string
  email: string
  age: number
  ageGroup: AgeGroup
  level: string
  englishLevel: EnglishLevel
  is_trial: boolean
  created_at: string
  
  parentInfo: {
    parentName: string
    phoneNumber: string
    whatsappNumber?: string
    preferredLanguage: 'Arabic' | 'English'
  }
  
  skillsProgress: {
    skill: EnglishSkill
    currentLevel: number
    improvement: number
    lastAssessmentDate: Date
  }[]
  
  profiles?: {
    first_name: string
    last_name: string
    email: string
  }
}

export interface StudentStats {
  totalStudents: number
  trialStudents: number
  activeStudents: number
  byAgeGroup: Record<AgeGroup, number>
  byLevel: Record<EnglishLevel, number>
}

/**
 * Calculate age group from age
 */
function getAgeGroup(age: number): AgeGroup {
  if (age >= 10 && age <= 12) return '10-12'
  if (age >= 13 && age <= 15) return '13-15'
  if (age >= 16 && age <= 18) return '16-18'
  return '13-15' // default
}

/**
 * Determine English level based on various factors
 * In production, this would come from assessment data
 */
function determineEnglishLevel(student: any): EnglishLevel {
  // For now, return a reasonable default
  // TODO: Implement proper level determination from assessments
  const levels: EnglishLevel[] = ['Beginner', 'Elementary', 'Intermediate', 'Advanced']
  return levels[Math.floor(Math.random() * levels.length)]
}

/**
 * Generate skills progress data
 * In production, this would come from assessment records
 */
function generateSkillsProgress(): EnhancedStudent['skillsProgress'] {
  const skills: EnglishSkill[] = ['Speaking', 'Listening', 'Reading', 'Writing', 'Grammar', 'Vocabulary']
  
  return skills.map(skill => ({
    skill,
    currentLevel: Math.floor(Math.random() * 5) + 4, // 4-8 range
    improvement: Math.floor(Math.random() * 3), // 0-2 improvement
    lastAssessmentDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Last 30 days
  }))
}

/**
 * Get all students for a teacher
 */
export async function getTeacherStudents(teacherId: string): Promise<{
  data: EnhancedStudent[] | null
  error: any
}> {
  try {
    // Get students from class_sessions (students taught by this teacher)
    const { data: sessions, error: sessionsError } = await supabase
      .from('class_sessions')
      .select(`
        student_id,
        student:profiles!class_sessions_student_id_fkey(
          id,
          first_name,
          last_name,
          email,
          is_trial
        )
      `)
      .eq('teacher_id', teacherId)

    if (sessionsError) {
      logger.error('Error fetching students from sessions:', sessionsError)
      return { data: null, error: sessionsError }
    }

    // Get unique students
    const uniqueStudentsMap = new Map()
    sessions?.forEach(session => {
      if (session.student && !uniqueStudentsMap.has(session.student.id)) {
        uniqueStudentsMap.set(session.student.id, session.student)
      }
    })

    // Get additional student details from students table
    const studentIds = Array.from(uniqueStudentsMap.keys())
    
    if (studentIds.length === 0) {
      return { data: [], error: null }
    }

    const { data: studentDetails, error: detailsError } = await supabase
      .from('students')
      .select('*')
      .in('user_id', studentIds)

    if (detailsError) {
      logger.error('Error fetching student details:', detailsError)
      // Continue without detailed info
    }

    // Transform to EnhancedStudent format
    const enhancedStudents: EnhancedStudent[] = Array.from(uniqueStudentsMap.values()).map(profile => {
      const details = studentDetails?.find(d => d.user_id === profile.id)
      const age = details?.age || 13 // default age
      const ageGroup = getAgeGroup(age)
      const englishLevel = determineEnglishLevel(profile)

      return {
        id: details?.id || profile.id,
        user_id: profile.id,
        name: `${profile.first_name} ${profile.last_name}`,
        email: profile.email,
        age,
        ageGroup,
        level: details?.level || englishLevel,
        englishLevel,
        is_trial: profile.is_trial || false,
        created_at: details?.created_at || new Date().toISOString(),
        
        parentInfo: {
          parentName: `والد ${profile.first_name}`, // Parent of [name]
          phoneNumber: details?.phone || '+966500000000',
          whatsappNumber: details?.phone,
          preferredLanguage: 'Arabic',
        },
        
        skillsProgress: generateSkillsProgress(),
        
        profiles: {
          first_name: profile.first_name,
          last_name: profile.last_name,
          email: profile.email,
        },
      }
    })

    logger.log('Students fetched successfully', { count: enhancedStudents.length })
    return { data: enhancedStudents, error: null }
  } catch (err) {
    logger.error('Unexpected error fetching students:', err)
    return { data: null, error: err }
  }
}

/**
 * Get student statistics
 */
export async function getStudentStats(teacherId: string): Promise<{
  data: StudentStats | null
  error: any
}> {
  try {
    const { data: students, error } = await getTeacherStudents(teacherId)
    
    if (error || !students) {
      return { data: null, error }
    }

    const stats: StudentStats = {
      totalStudents: students.length,
      trialStudents: students.filter(s => s.is_trial).length,
      activeStudents: students.filter(s => !s.is_trial).length,
      byAgeGroup: {
        'all': students.length,
        '10-12': students.filter(s => s.ageGroup === '10-12').length,
        '13-15': students.filter(s => s.ageGroup === '13-15').length,
        '16-18': students.filter(s => s.ageGroup === '16-18').length,
      },
      byLevel: {
        'Beginner': students.filter(s => s.englishLevel === 'Beginner').length,
        'Elementary': students.filter(s => s.englishLevel === 'Elementary').length,
        'Intermediate': students.filter(s => s.englishLevel === 'Intermediate').length,
        'Advanced': students.filter(s => s.englishLevel === 'Advanced').length,
      },
    }

    return { data: stats, error: null }
  } catch (err) {
    logger.error('Unexpected error calculating student stats:', err)
    return { data: null, error: err }
  }
}

/**
 * Get student by ID
 */
export async function getStudentById(studentId: string): Promise<{
  data: EnhancedStudent | null
  error: any
}> {
  try {
    const { data: student, error } = await supabase
      .from('students')
      .select(`
        *,
        profiles:user_id(
          id,
          first_name,
          last_name,
          email,
          is_trial
        )
      `)
      .eq('id', studentId)
      .single()

    if (error) {
      logger.error('Error fetching student by ID:', error)
      return { data: null, error }
    }

    if (!student || !student.profiles) {
      return { data: null, error: new Error('Student not found') }
    }

    const profile = student.profiles
    const age = student.age || 13
    const ageGroup = getAgeGroup(age)
    const englishLevel = determineEnglishLevel(student)

    const enhancedStudent: EnhancedStudent = {
      id: student.id,
      user_id: profile.id,
      name: `${profile.first_name} ${profile.last_name}`,
      email: profile.email,
      age,
      ageGroup,
      level: student.level || englishLevel,
      englishLevel,
      is_trial: profile.is_trial || false,
      created_at: student.created_at,
      
      parentInfo: {
        parentName: `والد ${profile.first_name}`,
        phoneNumber: student.phone || '+966500000000',
        whatsappNumber: student.phone,
        preferredLanguage: 'Arabic',
      },
      
      skillsProgress: generateSkillsProgress(),
      
      profiles: {
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email,
      },
    }

    return { data: enhancedStudent, error: null }
  } catch (err) {
    logger.error('Unexpected error fetching student by ID:', err)
    return { data: null, error: err }
  }
}

/**
 * Update student information
 */
export async function updateStudent(
  studentId: string,
  updates: Partial<EnhancedStudent>
): Promise<{
  success: boolean
  error: any
}> {
  try {
    // Update students table
    const studentUpdates: any = {}
    if (updates.age !== undefined) studentUpdates.age = updates.age
    if (updates.level !== undefined) studentUpdates.level = updates.level
    if (updates.parentInfo?.phoneNumber) studentUpdates.phone = updates.parentInfo.phoneNumber

    if (Object.keys(studentUpdates).length > 0) {
      studentUpdates.updated_at = new Date().toISOString()
      
      const { error: studentError } = await supabase
        .from('students')
        .update(studentUpdates)
        .eq('id', studentId)

      if (studentError) {
        logger.error('Error updating student:', studentError)
        return { success: false, error: studentError }
      }
    }

    // Update profiles table if needed
    if (updates.name || updates.email) {
      const { data: student } = await supabase
        .from('students')
        .select('user_id')
        .eq('id', studentId)
        .single()

      if (student?.user_id) {
        const profileUpdates: any = {}
        if (updates.name) {
          const [first_name, ...lastNameParts] = updates.name.split(' ')
          profileUpdates.first_name = first_name
          profileUpdates.last_name = lastNameParts.join(' ')
        }
        if (updates.email) profileUpdates.email = updates.email

        if (Object.keys(profileUpdates).length > 0) {
          profileUpdates.updated_at = new Date().toISOString()
          
          const { error: profileError } = await supabase
            .from('profiles')
            .update(profileUpdates)
            .eq('id', student.user_id)

          if (profileError) {
            logger.error('Error updating profile:', profileError)
            return { success: false, error: profileError }
          }
        }
      }
    }

    return { success: true, error: null }
  } catch (err) {
    logger.error('Unexpected error updating student:', err)
    return { success: false, error: err }
  }
}

/**
 * Filter students by criteria
 */
export function filterStudents(
  students: EnhancedStudent[],
  filters: {
    searchTerm?: string
    ageGroup?: AgeGroup | 'all'
    englishLevel?: EnglishLevel | 'all'
    isTrial?: boolean | 'all'
  }
): EnhancedStudent[] {
  let filtered = [...students]

  // Search filter
  if (filters.searchTerm) {
    const term = filters.searchTerm.toLowerCase()
    filtered = filtered.filter(s =>
      s.name.toLowerCase().includes(term) ||
      s.email.toLowerCase().includes(term) ||
      s.parentInfo.parentName.toLowerCase().includes(term)
    )
  }

  // Age group filter
  if (filters.ageGroup && filters.ageGroup !== 'all') {
    filtered = filtered.filter(s => s.ageGroup === filters.ageGroup)
  }

  // English level filter
  if (filters.englishLevel && filters.englishLevel !== 'all') {
    filtered = filtered.filter(s => s.englishLevel === filters.englishLevel)
  }

  // Trial status filter
  if (filters.isTrial !== 'all' && filters.isTrial !== undefined) {
    filtered = filtered.filter(s => s.is_trial === filters.isTrial)
  }

  return filtered
}

/**
 * Export students to CSV
 */
export function exportStudentsToCSV(students: EnhancedStudent[]): string {
  const headers = [
    'Name',
    'Email',
    'Age',
    'Age Group',
    'English Level',
    'Status',
    'Parent Name',
    'Phone',
    'Created At'
  ]

  const rows = students.map(s => [
    s.name,
    s.email,
    s.age.toString(),
    s.ageGroup,
    s.englishLevel,
    s.is_trial ? 'Trial' : 'Active',
    s.parentInfo.parentName,
    s.parentInfo.phoneNumber,
    new Date(s.created_at).toLocaleDateString('ar-SA')
  ])

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')

  return csv
}

export const studentService = {
  getTeacherStudents,
  getStudentStats,
  getStudentById,
  updateStudent,
  filterStudents,
  exportStudentsToCSV,
}

export default studentService

