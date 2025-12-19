/**
 * Student Helper Utilities
 * 
 * Reusable functions for student data formatting and display
 */

interface StudentNameData {
  name?: string
  profiles?: {
    first_name?: string
    last_name?: string
  }
}

interface FormatStudentNameOptions {
  fallback?: string
  format?: 'full' | 'first' | 'last'
}

/**
 * Format student name with proper fallback handling
 * 
 * Priority:
 * 1. Full name from profiles (first_name + last_name)
 * 2. Single name field
 * 3. Default fallback text
 * 
 * @param student - Student object with name and profiles data
 * @param options - Formatting options
 * @returns Formatted student name
 * 
 * @example
 * // Full name from profiles
 * formatStudentName({ profiles: { first_name: 'أحمد', last_name: 'محمد' } })
 * // Returns: "أحمد محمد"
 * 
 * @example
 * // Fallback to name field
 * formatStudentName({ name: 'أحمد' })
 * // Returns: "أحمد"
 * 
 * @example
 * // Default fallback
 * formatStudentName({})
 * // Returns: "طالب"
 * 
 * @example
 * // First name only
 * formatStudentName(
 *   { profiles: { first_name: 'أحمد', last_name: 'محمد' } },
 *   { format: 'first' }
 * )
 * // Returns: "أحمد"
 */
export const formatStudentName = (
  student: StudentNameData,
  options?: FormatStudentNameOptions
): string => {
  const fallback = options?.fallback || 'طالب'
  const format = options?.format || 'full'
  
  const firstName = student.profiles?.first_name
  const lastName = student.profiles?.last_name
  
  // Handle specific format requests
  if (format === 'first' && firstName) {
    return firstName
  }
  
  if (format === 'last' && lastName) {
    return lastName
  }
  
  // Full name format (default)
  if (format === 'full' && firstName && lastName) {
    return `${firstName} ${lastName}`
  }
  
  // Fallback to single name field
  if (student.name) {
    return student.name
  }
  
  // Final fallback
  return fallback
}

/**
 * Get student initials for avatar display
 * 
 * @param student - Student object with name data
 * @returns Student initials (1-2 characters)
 * 
 * @example
 * getStudentInitials({ profiles: { first_name: 'أحمد', last_name: 'محمد' } })
 * // Returns: "أم"
 */
export const getStudentInitials = (student: StudentNameData): string => {
  const firstName = student.profiles?.first_name
  const lastName = student.profiles?.last_name
  
  if (firstName && lastName) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`
  }
  
  if (firstName) {
    return firstName.charAt(0)
  }
  
  if (student.name) {
    return student.name.charAt(0)
  }
  
  return 'ط' // Default: first letter of "طالب"
}

/**
 * Check if student has complete profile data
 * 
 * @param student - Student object
 * @returns True if student has first and last name in profiles
 */
export const hasCompleteProfile = (student: StudentNameData): boolean => {
  return !!(student.profiles?.first_name && student.profiles?.last_name)
}

/**
 * Get student display email
 * 
 * @param student - Student object with email data
 * @returns Student email with fallback
 */
export const getStudentEmail = (
  student: { email?: string; profiles?: { email?: string } }
): string => {
  return student.profiles?.email || student.email || 'لا يوجد بريد إلكتروني'
}
