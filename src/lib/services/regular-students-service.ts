import { supabase } from '../supabase'
import { logger } from '../logger'

/**
 * Regular Students Service
 * Handles operations specifically for regular (non-trial) students
 */

export interface RegularStudentInfo {
  id: string
  email: string
  first_name: string
  last_name: string
  full_name: string
  phone?: string
  created_at: string
  credits?: number
}

/**
 * Get all regular students with their email addresses
 * A regular student is defined as: is_trial = false
 */
export async function getAllRegularStudents(): Promise<{
  data: RegularStudentInfo[] | null
  error: any
}> {
  try {
    logger.log('Fetching all regular students...')

    // Query profiles where is_trial = false and role = 'student'
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name, phone, created_at, is_trial, role')
      .eq('is_trial', false)
      .in('role', ['student', 'user']) // Include both 'student' role and generic 'user' role
      .order('created_at', { ascending: false })

    if (profilesError) {
      logger.error('Error fetching regular students:', profilesError)
      return { data: null, error: profilesError }
    }

    if (!profiles || profiles.length === 0) {
      logger.log('No regular students found')
      return { data: [], error: null }
    }

    // Get credits for each student
    const userIds = profiles.map(p => p.id)
    const { data: creditsData, error: creditsError } = await supabase
      .from('class_credits')
      .select('user_id, credits')
      .in('user_id', userIds)

    if (creditsError) {
      logger.warn('Error fetching credits, continuing without them:', creditsError)
    }

    // Map credits to a lookup object
    const creditsMap = new Map<string, number>()
    if (creditsData) {
      creditsData.forEach(credit => {
        creditsMap.set(credit.user_id, credit.credits)
      })
    }

    // Transform to RegularStudentInfo
    const regularStudents: RegularStudentInfo[] = profiles.map(profile => ({
      id: profile.id,
      email: profile.email,
      first_name: profile.first_name,
      last_name: profile.last_name,
      full_name: `${profile.first_name} ${profile.last_name}`,
      phone: profile.phone,
      created_at: profile.created_at,
      credits: creditsMap.get(profile.id) || 0,
    }))

    logger.log(`Found ${regularStudents.length} regular students`)

    return { data: regularStudents, error: null }
  } catch (err) {
    logger.error('Unexpected error fetching regular students:', err)
    return { data: null, error: err }
  }
}

/**
 * Get only email addresses of regular students
 * Useful for email campaigns, newsletters, etc.
 */
export async function getRegularStudentEmails(): Promise<{
  data: string[] | null
  error: any
}> {
  try {
    const { data: students, error } = await getAllRegularStudents()

    if (error) {
      return { data: null, error }
    }

    const emails = students?.map(student => student.email).filter(email => email) || []

    logger.log(`Extracted ${emails.length} email addresses from regular students`)

    return { data: emails, error: null }
  } catch (err) {
    logger.error('Error extracting regular student emails:', err)
    return { data: null, error: err }
  }
}

/**
 * Get regular students count
 */
export async function getRegularStudentsCount(): Promise<{
  data: number
  error: any
}> {
  try {
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_trial', false)
      .in('role', ['student', 'user'])

    if (error) {
      logger.error('Error counting regular students:', error)
      return { data: 0, error }
    }

    return { data: count || 0, error: null }
  } catch (err) {
    logger.error('Unexpected error counting regular students:', err)
    return { data: 0, error: err }
  }
}

/**
 * Export regular students to CSV format
 */
export function exportRegularStudentsToCSV(students: RegularStudentInfo[]): string {
  const headers = ['ID', 'Email', 'First Name', 'Last Name', 'Phone', 'Credits', 'Created At']
  const rows = students.map(student => [
    student.id,
    student.email,
    student.first_name,
    student.last_name,
    student.phone || 'N/A',
    student.credits?.toString() || '0',
    new Date(student.created_at).toLocaleDateString(),
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n')

  return csvContent
}

/**
 * Check if a student is regular (not trial)
 */
export async function isRegularStudent(userId: string): Promise<{
  data: boolean
  error: any
}> {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('is_trial')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      logger.error('Error checking if student is regular:', error)
      return { data: false, error }
    }

    if (!profile) {
      return { data: false, error: new Error('Student not found') }
    }

    return { data: !profile.is_trial, error: null }
  } catch (err) {
    logger.error('Unexpected error checking student type:', err)
    return { data: false, error: err }
  }
}

const regularStudentsService = {
  getAllRegularStudents,
  getRegularStudentEmails,
  getRegularStudentsCount,
  exportRegularStudentsToCSV,
  isRegularStudent,
}

export default regularStudentsService

