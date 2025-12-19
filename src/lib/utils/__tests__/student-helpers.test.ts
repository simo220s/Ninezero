/**
 * Unit Tests for Student Helper Utilities
 */

import { describe, it, expect } from 'vitest'
import {
  formatStudentName,
  getStudentInitials,
  hasCompleteProfile,
  getStudentEmail,
} from '../student-helpers'

describe('formatStudentName', () => {
  it('should return full name when profiles has first_name and last_name', () => {
    const student = {
      profiles: {
        first_name: 'أحمد',
        last_name: 'محمد',
      },
    }
    expect(formatStudentName(student)).toBe('أحمد محمد')
  })

  it('should fallback to name field when profiles is incomplete', () => {
    const student = {
      name: 'أحمد',
      profiles: {
        first_name: 'أحمد',
      },
    }
    expect(formatStudentName(student)).toBe('أحمد')
  })

  it('should return default fallback when no name data exists', () => {
    const student = {}
    expect(formatStudentName(student)).toBe('طالب')
  })

  it('should use custom fallback when provided', () => {
    const student = {}
    expect(formatStudentName(student, { fallback: 'غير محدد' })).toBe('غير محدد')
  })

  it('should return first name only when format is "first"', () => {
    const student = {
      profiles: {
        first_name: 'أحمد',
        last_name: 'محمد',
      },
    }
    expect(formatStudentName(student, { format: 'first' })).toBe('أحمد')
  })

  it('should return last name only when format is "last"', () => {
    const student = {
      profiles: {
        first_name: 'أحمد',
        last_name: 'محمد',
      },
    }
    expect(formatStudentName(student, { format: 'last' })).toBe('محمد')
  })

  it('should handle empty strings in profiles', () => {
    const student = {
      name: 'أحمد',
      profiles: {
        first_name: '',
        last_name: '',
      },
    }
    expect(formatStudentName(student)).toBe('أحمد')
  })

  it('should handle undefined profiles', () => {
    const student = {
      name: 'أحمد',
    }
    expect(formatStudentName(student)).toBe('أحمد')
  })

  it('should prioritize profiles over name field', () => {
    const student = {
      name: 'Old Name',
      profiles: {
        first_name: 'أحمد',
        last_name: 'محمد',
      },
    }
    expect(formatStudentName(student)).toBe('أحمد محمد')
  })
})

describe('getStudentInitials', () => {
  it('should return initials from first and last name', () => {
    const student = {
      profiles: {
        first_name: 'أحمد',
        last_name: 'محمد',
      },
    }
    expect(getStudentInitials(student)).toBe('أم')
  })

  it('should return first letter of first name only', () => {
    const student = {
      profiles: {
        first_name: 'أحمد',
      },
    }
    expect(getStudentInitials(student)).toBe('أ')
  })

  it('should fallback to name field', () => {
    const student = {
      name: 'أحمد',
    }
    expect(getStudentInitials(student)).toBe('أ')
  })

  it('should return default initial when no name data exists', () => {
    const student = {}
    expect(getStudentInitials(student)).toBe('ط')
  })

  it('should handle empty strings', () => {
    const student = {
      name: '',
      profiles: {
        first_name: '',
        last_name: '',
      },
    }
    expect(getStudentInitials(student)).toBe('ط')
  })
})

describe('hasCompleteProfile', () => {
  it('should return true when both first_name and last_name exist', () => {
    const student = {
      profiles: {
        first_name: 'أحمد',
        last_name: 'محمد',
      },
    }
    expect(hasCompleteProfile(student)).toBe(true)
  })

  it('should return false when only first_name exists', () => {
    const student = {
      profiles: {
        first_name: 'أحمد',
      },
    }
    expect(hasCompleteProfile(student)).toBe(false)
  })

  it('should return false when only last_name exists', () => {
    const student = {
      profiles: {
        last_name: 'محمد',
      },
    }
    expect(hasCompleteProfile(student)).toBe(false)
  })

  it('should return false when profiles is undefined', () => {
    const student = {}
    expect(hasCompleteProfile(student)).toBe(false)
  })

  it('should return false when names are empty strings', () => {
    const student = {
      profiles: {
        first_name: '',
        last_name: '',
      },
    }
    expect(hasCompleteProfile(student)).toBe(false)
  })
})

describe('getStudentEmail', () => {
  it('should return email from profiles', () => {
    const student = {
      email: 'old@example.com',
      profiles: {
        email: 'new@example.com',
      },
    }
    expect(getStudentEmail(student)).toBe('new@example.com')
  })

  it('should fallback to email field', () => {
    const student = {
      email: 'student@example.com',
    }
    expect(getStudentEmail(student)).toBe('student@example.com')
  })

  it('should return default message when no email exists', () => {
    const student = {}
    expect(getStudentEmail(student)).toBe('لا يوجد بريد إلكتروني')
  })

  it('should handle empty strings', () => {
    const student = {
      email: '',
      profiles: {
        email: '',
      },
    }
    expect(getStudentEmail(student)).toBe('لا يوجد بريد إلكتروني')
  })
})

describe('Edge Cases', () => {
  it('should handle null values gracefully', () => {
    const student = {
      name: null as any,
      profiles: null as any,
    }
    expect(formatStudentName(student)).toBe('طالب')
    expect(getStudentInitials(student)).toBe('ط')
  })

  it('should handle special characters in names', () => {
    const student = {
      profiles: {
        first_name: 'أحمد-علي',
        last_name: 'محمد (الصغير)',
      },
    }
    expect(formatStudentName(student)).toBe('أحمد-علي محمد (الصغير)')
  })

  it('should handle very long names', () => {
    const student = {
      profiles: {
        first_name: 'أحمد علي محمد حسن',
        last_name: 'عبدالله إبراهيم',
      },
    }
    expect(formatStudentName(student)).toBe('أحمد علي محمد حسن عبدالله إبراهيم')
  })

  it('should handle English names', () => {
    const student = {
      profiles: {
        first_name: 'John',
        last_name: 'Doe',
      },
    }
    expect(formatStudentName(student)).toBe('John Doe')
    expect(getStudentInitials(student)).toBe('JD')
  })

  it('should handle mixed Arabic and English names', () => {
    const student = {
      profiles: {
        first_name: 'Ahmed',
        last_name: 'محمد',
      },
    }
    expect(formatStudentName(student)).toBe('Ahmed محمد')
  })
})
