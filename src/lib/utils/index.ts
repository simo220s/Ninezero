/**
 * Utility Functions Index
 * 
 * Central export point for all utility functions
 * Makes imports cleaner and more organized
 */

// Student helper utilities
export {
  formatStudentName,
  getStudentInitials,
  hasCompleteProfile,
  getStudentEmail,
} from './student-helpers'

// Async handler utilities
export {
  asyncHandler,
  asyncHandlerWithToast,
  type AsyncHandlerOptions,
} from './async-handler'

// Logger utilities
export { logger } from './logger'

// Note: cn utility is exported from src/lib/utils.ts
// Import it directly: import { cn } from '@/lib/utils'
