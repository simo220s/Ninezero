/**
 * Authorization Middleware
 * 
 * Provides authorization checks for management features
 * Integrates with existing permissions system
 */

import { hasPermission, hasRole, type UserWithPermissions, ROLES, PERMISSIONS } from '../auth/permissions'
import { logSecurityEvent, AuditEventType } from './audit-logging'

/**
 * Authorization result
 */
export interface AuthorizationResult {
  authorized: boolean
  reason?: string
}

/**
 * Check if user can manage students
 */
export function canManageStudents(user: UserWithPermissions | null): AuthorizationResult {
  if (!user) {
    return { authorized: false, reason: 'User not authenticated' }
  }
  
  const hasAccess = hasPermission(user, PERMISSIONS.VIEW_STUDENTS) &&
                    hasPermission(user, PERMISSIONS.EDIT_STUDENTS)
  
  if (!hasAccess) {
    logSecurityEvent(user.id.toString(), AuditEventType.PERMISSION_DENIED, 'Attempted to access student management')
    return { authorized: false, reason: 'Insufficient permissions for student management' }
  }
  
  return { authorized: true }
}

/**
 * Check if user can create students
 */
export function canCreateStudents(user: UserWithPermissions | null): AuthorizationResult {
  if (!user) {
    return { authorized: false, reason: 'User not authenticated' }
  }
  
  const hasAccess = hasPermission(user, PERMISSIONS.CREATE_STUDENTS)
  
  if (!hasAccess) {
    logSecurityEvent(user.id.toString(), AuditEventType.PERMISSION_DENIED, 'Attempted to create student')
    return { authorized: false, reason: 'Insufficient permissions to create students' }
  }
  
  return { authorized: true }
}

/**
 * Check if user can delete students
 */
export function canDeleteStudents(user: UserWithPermissions | null): AuthorizationResult {
  if (!user) {
    return { authorized: false, reason: 'User not authenticated' }
  }
  
  const hasAccess = hasPermission(user, PERMISSIONS.DELETE_STUDENTS)
  
  if (!hasAccess) {
    logSecurityEvent(user.id.toString(), AuditEventType.PERMISSION_DENIED, 'Attempted to delete student')
    return { authorized: false, reason: 'Insufficient permissions to delete students' }
  }
  
  return { authorized: true }
}

/**
 * Check if user can manage classes
 */
export function canManageClasses(user: UserWithPermissions | null): AuthorizationResult {
  if (!user) {
    return { authorized: false, reason: 'User not authenticated' }
  }
  
  const hasAccess = hasPermission(user, PERMISSIONS.VIEW_CLASSES) &&
                    hasPermission(user, PERMISSIONS.EDIT_CLASSES)
  
  if (!hasAccess) {
    logSecurityEvent(user.id.toString(), AuditEventType.PERMISSION_DENIED, 'Attempted to access class management')
    return { authorized: false, reason: 'Insufficient permissions for class management' }
  }
  
  return { authorized: true }
}

/**
 * Check if user can create classes
 */
export function canCreateClasses(user: UserWithPermissions | null): AuthorizationResult {
  if (!user) {
    return { authorized: false, reason: 'User not authenticated' }
  }
  
  const hasAccess = hasPermission(user, PERMISSIONS.CREATE_CLASSES)
  
  if (!hasAccess) {
    logSecurityEvent(user.id.toString(), AuditEventType.PERMISSION_DENIED, 'Attempted to create class')
    return { authorized: false, reason: 'Insufficient permissions to create classes' }
  }
  
  return { authorized: true }
}

/**
 * Check if user can delete classes
 */
export function canDeleteClasses(user: UserWithPermissions | null): AuthorizationResult {
  if (!user) {
    return { authorized: false, reason: 'User not authenticated' }
  }
  
  const hasAccess = hasPermission(user, PERMISSIONS.DELETE_CLASSES)
  
  if (!hasAccess) {
    logSecurityEvent(user.id.toString(), AuditEventType.PERMISSION_DENIED, 'Attempted to delete class')
    return { authorized: false, reason: 'Insufficient permissions to delete classes' }
  }
  
  return { authorized: true }
}

/**
 * Check if user can view financials
 */
export function canViewFinancials(user: UserWithPermissions | null): AuthorizationResult {
  if (!user) {
    return { authorized: false, reason: 'User not authenticated' }
  }
  
  const hasAccess = hasPermission(user, PERMISSIONS.VIEW_FINANCIALS)
  
  if (!hasAccess) {
    logSecurityEvent(user.id.toString(), AuditEventType.PERMISSION_DENIED, 'Attempted to access financials')
    return { authorized: false, reason: 'Insufficient permissions to view financials' }
  }
  
  return { authorized: true }
}

/**
 * Check if user can manage payments
 */
export function canManagePayments(user: UserWithPermissions | null): AuthorizationResult {
  if (!user) {
    return { authorized: false, reason: 'User not authenticated' }
  }
  
  const hasAccess = hasPermission(user, PERMISSIONS.MANAGE_PAYMENTS)
  
  if (!hasAccess) {
    logSecurityEvent(user.id.toString(), AuditEventType.PERMISSION_DENIED, 'Attempted to manage payments')
    return { authorized: false, reason: 'Insufficient permissions to manage payments' }
  }
  
  return { authorized: true }
}

/**
 * Check if user can view statistics
 */
export function canViewStatistics(user: UserWithPermissions | null): AuthorizationResult {
  if (!user) {
    return { authorized: false, reason: 'User not authenticated' }
  }
  
  const hasAccess = hasPermission(user, PERMISSIONS.VIEW_STATISTICS)
  
  if (!hasAccess) {
    logSecurityEvent(user.id.toString(), AuditEventType.PERMISSION_DENIED, 'Attempted to access statistics')
    return { authorized: false, reason: 'Insufficient permissions to view statistics' }
  }
  
  return { authorized: true }
}

/**
 * Check if user can manage reviews
 */
export function canManageReviews(user: UserWithPermissions | null): AuthorizationResult {
  if (!user) {
    return { authorized: false, reason: 'User not authenticated' }
  }
  
  const hasAccess = hasPermission(user, PERMISSIONS.VIEW_REVIEWS) &&
                    hasPermission(user, PERMISSIONS.RESPOND_REVIEWS)
  
  if (!hasAccess) {
    logSecurityEvent(user.id.toString(), AuditEventType.PERMISSION_DENIED, 'Attempted to manage reviews')
    return { authorized: false, reason: 'Insufficient permissions to manage reviews' }
  }
  
  return { authorized: true }
}

/**
 * Check if user can export data
 */
export function canExportData(user: UserWithPermissions | null): AuthorizationResult {
  if (!user) {
    return { authorized: false, reason: 'User not authenticated' }
  }
  
  // Only teachers and admins can export data
  const hasAccess = hasRole(user, ROLES.TEACHER) || hasRole(user, ROLES.SUPER_ADMIN)
  
  if (!hasAccess) {
    logSecurityEvent(user.id.toString(), AuditEventType.PERMISSION_DENIED, 'Attempted to export data')
    return { authorized: false, reason: 'Insufficient permissions to export data' }
  }
  
  return { authorized: true }
}

/**
 * Check if user can manage coupons
 */
export function canManageCoupons(user: UserWithPermissions | null): AuthorizationResult {
  if (!user) {
    return { authorized: false, reason: 'User not authenticated' }
  }
  
  // Only teachers and admins can manage coupons
  const hasAccess = hasRole(user, ROLES.TEACHER) || hasRole(user, ROLES.SUPER_ADMIN)
  
  if (!hasAccess) {
    logSecurityEvent(user.id.toString(), AuditEventType.PERMISSION_DENIED, 'Attempted to manage coupons')
    return { authorized: false, reason: 'Insufficient permissions to manage coupons' }
  }
  
  return { authorized: true }
}

/**
 * Check if user can manage packages
 */
export function canManagePackages(user: UserWithPermissions | null): AuthorizationResult {
  if (!user) {
    return { authorized: false, reason: 'User not authenticated' }
  }
  
  // Only teachers and admins can manage packages
  const hasAccess = hasRole(user, ROLES.TEACHER) || hasRole(user, ROLES.SUPER_ADMIN)
  
  if (!hasAccess) {
    logSecurityEvent(user.id.toString(), AuditEventType.PERMISSION_DENIED, 'Attempted to manage packages')
    return { authorized: false, reason: 'Insufficient permissions to manage packages' }
  }
  
  return { authorized: true }
}

/**
 * Check if user can manage categories
 */
export function canManageCategories(user: UserWithPermissions | null): AuthorizationResult {
  if (!user) {
    return { authorized: false, reason: 'User not authenticated' }
  }
  
  // Only teachers and admins can manage categories
  const hasAccess = hasRole(user, ROLES.TEACHER) || hasRole(user, ROLES.SUPER_ADMIN)
  
  if (!hasAccess) {
    logSecurityEvent(user.id.toString(), AuditEventType.PERMISSION_DENIED, 'Attempted to manage categories')
    return { authorized: false, reason: 'Insufficient permissions to manage categories' }
  }
  
  return { authorized: true }
}

/**
 * Check if user can access resource
 */
export function canAccessResource(
  user: UserWithPermissions | null,
  resourceType: 'student' | 'class' | 'payment' | 'coupon' | 'package',
  resourceOwnerId?: string
): AuthorizationResult {
  if (!user) {
    return { authorized: false, reason: 'User not authenticated' }
  }
  
  // Super admin can access everything
  if (hasRole(user, ROLES.SUPER_ADMIN)) {
    return { authorized: true }
  }
  
  // Teachers can access their own resources
  if (hasRole(user, ROLES.TEACHER)) {
    if (resourceOwnerId && resourceOwnerId !== user.id.toString()) {
      logSecurityEvent(user.id.toString(), AuditEventType.UNAUTHORIZED_ACCESS, `Attempted to access ${resourceType} owned by ${resourceOwnerId}`)
      return { authorized: false, reason: 'Cannot access resources owned by other users' }
    }
    return { authorized: true }
  }
  
  // Students can only access their own resources
  if (hasRole(user, ROLES.STUDENT)) {
    if (resourceOwnerId && resourceOwnerId !== user.id.toString()) {
      logSecurityEvent(user.id.toString(), AuditEventType.UNAUTHORIZED_ACCESS, `Attempted to access ${resourceType} owned by ${resourceOwnerId}`)
      return { authorized: false, reason: 'Cannot access resources owned by other users' }
    }
    return { authorized: true }
  }
  
  return { authorized: false, reason: 'Unknown user role' }
}

/**
 * Require authorization or throw error
 */
export function requireAuthorization(result: AuthorizationResult): void {
  if (!result.authorized) {
    const error = new Error(result.reason || 'Unauthorized')
    error.name = 'AuthorizationError'
    throw error
  }
}

/**
 * Authorization guard for async operations
 */
export async function withAuthorization<T>(
  authCheck: () => AuthorizationResult,
  operation: () => Promise<T>
): Promise<T> {
  const result = authCheck()
  requireAuthorization(result)
  return await operation()
}

export default {
  canManageStudents,
  canCreateStudents,
  canDeleteStudents,
  canManageClasses,
  canCreateClasses,
  canDeleteClasses,
  canViewFinancials,
  canManagePayments,
  canViewStatistics,
  canManageReviews,
  canExportData,
  canManageCoupons,
  canManagePackages,
  canManageCategories,
  canAccessResource,
  requireAuthorization,
  withAuthorization,
}
