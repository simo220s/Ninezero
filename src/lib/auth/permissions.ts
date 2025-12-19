/**
 * Permissions System Integration
 * 
 * Integrates with Spatie Laravel Permission package used in Cyaxaress LMS
 * Provides role-based access control for the React frontend
 */

import { logger } from '../logger'

// Spatie role constants matching Cyaxaress\RolePermissions\Models\Role
export const ROLES = {
  SUPER_ADMIN: 'super-admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
} as const

export type UserRole = typeof ROLES[keyof typeof ROLES]

// Permission definitions
export const PERMISSIONS = {
  // Student Management
  VIEW_STUDENTS: 'view_students',
  CREATE_STUDENTS: 'create_students',
  EDIT_STUDENTS: 'edit_students',
  DELETE_STUDENTS: 'delete_students',
  
  // Class Management
  VIEW_CLASSES: 'view_classes',
  CREATE_CLASSES: 'create_classes',
  EDIT_CLASSES: 'edit_classes',
  DELETE_CLASSES: 'delete_classes',
  
  // Course Management
  VIEW_COURSES: 'view_courses',
  CREATE_COURSES: 'create_courses',
  EDIT_COURSES: 'edit_courses',
  DELETE_COURSES: 'delete_courses',
  
  // Financial Management
  VIEW_FINANCIALS: 'view_financials',
  MANAGE_PAYMENTS: 'manage_payments',
  VIEW_SETTLEMENTS: 'view_settlements',
  
  // Review Management
  VIEW_REVIEWS: 'view_reviews',
  RESPOND_REVIEWS: 'respond_reviews',
  
  // Statistics
  VIEW_STATISTICS: 'view_statistics',
  VIEW_ANALYTICS: 'view_analytics',
} as const

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS]

// Role-Permission mapping (matches Spatie configuration)
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS), // Super admin has all permissions
  
  [ROLES.TEACHER]: [
    PERMISSIONS.VIEW_STUDENTS,
    PERMISSIONS.EDIT_STUDENTS,
    PERMISSIONS.VIEW_CLASSES,
    PERMISSIONS.CREATE_CLASSES,
    PERMISSIONS.EDIT_CLASSES,
    PERMISSIONS.DELETE_CLASSES,
    PERMISSIONS.VIEW_COURSES,
    PERMISSIONS.CREATE_COURSES,
    PERMISSIONS.EDIT_COURSES,
    PERMISSIONS.VIEW_FINANCIALS,
    PERMISSIONS.VIEW_SETTLEMENTS,
    PERMISSIONS.VIEW_REVIEWS,
    PERMISSIONS.RESPOND_REVIEWS,
    PERMISSIONS.VIEW_STATISTICS,
    PERMISSIONS.VIEW_ANALYTICS,
  ],
  
  [ROLES.STUDENT]: [
    PERMISSIONS.VIEW_CLASSES,
    PERMISSIONS.VIEW_COURSES,
    PERMISSIONS.VIEW_REVIEWS,
  ],
}

/**
 * User with role and permissions
 */
export interface UserWithPermissions {
  id: string | number
  email: string
  role: UserRole
  permissions?: Permission[]
}

/**
 * Check if user has a specific role
 */
export function hasRole(user: UserWithPermissions | null, role: UserRole): boolean {
  if (!user) return false
  return user.role === role || user.role === ROLES.SUPER_ADMIN
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(user: UserWithPermissions | null, roles: UserRole[]): boolean {
  if (!user) return false
  return roles.includes(user.role) || user.role === ROLES.SUPER_ADMIN
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(user: UserWithPermissions | null, permission: Permission): boolean {
  if (!user) return false
  
  // Super admin has all permissions
  if (user.role === ROLES.SUPER_ADMIN) return true
  
  // Check explicit permissions if provided
  if (user.permissions) {
    return user.permissions.includes(permission)
  }
  
  // Fall back to role-based permissions
  const rolePermissions = ROLE_PERMISSIONS[user.role] || []
  return rolePermissions.includes(permission)
}

/**
 * Check if user has all of the specified permissions
 */
export function hasAllPermissions(user: UserWithPermissions | null, permissions: Permission[]): boolean {
  if (!user) return false
  return permissions.every(permission => hasPermission(user, permission))
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(user: UserWithPermissions | null, permissions: Permission[]): boolean {
  if (!user) return false
  return permissions.some(permission => hasPermission(user, permission))
}

/**
 * Get all permissions for a user
 */
export function getUserPermissions(user: UserWithPermissions | null): Permission[] {
  if (!user) return []
  
  // Return explicit permissions if provided
  if (user.permissions) {
    return user.permissions
  }
  
  // Return role-based permissions
  return ROLE_PERMISSIONS[user.role] || []
}

/**
 * Check if user can access a specific route
 */
export function canAccessRoute(user: UserWithPermissions | null, requiredRoles: UserRole[]): boolean {
  if (!user) return false
  return hasAnyRole(user, requiredRoles)
}

/**
 * Permission guard for components
 */
export function requirePermission(
  user: UserWithPermissions | null,
  permission: Permission,
  onDenied?: () => void
): boolean {
  const hasAccess = hasPermission(user, permission)
  
  if (!hasAccess && onDenied) {
    logger.warn(`Permission denied: ${permission} for user ${user?.id}`)
    onDenied()
  }
  
  return hasAccess
}

/**
 * Role guard for components
 */
export function requireRole(
  user: UserWithPermissions | null,
  role: UserRole,
  onDenied?: () => void
): boolean {
  const hasAccess = hasRole(user, role)
  
  if (!hasAccess && onDenied) {
    logger.warn(`Role check failed: ${role} for user ${user?.id}`)
    onDenied()
  }
  
  return hasAccess
}

/**
 * Get user role display name
 */
export function getRoleDisplayName(role: UserRole, language: 'en' | 'ar' = 'ar'): string {
  const roleNames = {
    [ROLES.SUPER_ADMIN]: { en: 'Super Admin', ar: 'مدير النظام' },
    [ROLES.TEACHER]: { en: 'Teacher', ar: 'معلم' },
    [ROLES.STUDENT]: { en: 'Student', ar: 'طالب' },
  }
  
  return roleNames[role]?.[language] || role
}

/**
 * Check if user is teacher or admin
 */
export function isTeacherOrAdmin(user: UserWithPermissions | null): boolean {
  return hasAnyRole(user, [ROLES.TEACHER, ROLES.SUPER_ADMIN])
}

/**
 * Check if user is student
 */
export function isStudent(user: UserWithPermissions | null): boolean {
  return hasRole(user, ROLES.STUDENT)
}

export default {
  ROLES,
  PERMISSIONS,
  hasRole,
  hasAnyRole,
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  getUserPermissions,
  canAccessRoute,
  requirePermission,
  requireRole,
  getRoleDisplayName,
  isTeacherOrAdmin,
  isStudent,
}
