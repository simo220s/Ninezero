/**
 * React Query Keys
 * 
 * Centralized query key definitions for React Query
 * Ensures consistent cache management across the application
 * 
 * @see https://tanstack.com/query/latest/docs/react/guides/query-keys
 */

/**
 * Student-related query keys
 */
export const STUDENT_QUERY_KEYS = {
  all: (teacherId: string) => ['students', teacherId] as const,
  byId: (studentId: string) => ['students', 'detail', studentId] as const,
  stats: (teacherId: string) => ['students', 'stats', teacherId] as const,
  list: (filters?: Record<string, any>) => ['students', 'list', filters] as const,
} as const

/**
 * Class/Session-related query keys
 */
export const CLASS_QUERY_KEYS = {
  teacher: (teacherId: string) => ['classes', 'teacher', teacherId] as const,
  student: (studentId: string) => ['classes', 'student', studentId] as const,
  upcoming: (userId: string, role: 'teacher' | 'student') => ['classes', 'upcoming', role, userId] as const,
  today: (userId: string, role: 'teacher' | 'student') => ['classes', 'today', role, userId] as const,
  byId: (classId: string) => ['classes', 'detail', classId] as const,
  all: () => ['classes'] as const,
} as const

/**
 * Statistics and analytics query keys
 */
export const STATS_QUERY_KEYS = {
  teacherStats: (teacherId: string) => ['stats', 'teacher', teacherId] as const,
  classStats: (teacherId: string) => ['stats', 'classes', teacherId] as const,
  performance: (teacherId: string, timeRange: string) => ['stats', 'performance', teacherId, timeRange] as const,
  ageGroups: (teacherId: string) => ['stats', 'ageGroups', teacherId] as const,
  levels: (teacherId: string) => ['stats', 'levels', teacherId] as const,
  trends: (teacherId: string, months: number) => ['stats', 'trends', teacherId, months] as const,
  all: (teacherId: string) => ['stats', teacherId] as const,
} as const

/**
 * Credit-related query keys
 */
export const CREDIT_QUERY_KEYS = {
  balance: (studentId: string) => ['credits', 'balance', studentId] as const,
  history: (studentId: string, filters?: Record<string, any>) => ['credits', 'history', studentId, filters] as const,
  stats: (studentId: string) => ['credits', 'stats', studentId] as const,
  all: (studentId: string) => ['credits', studentId] as const,
} as const

/**
 * Review-related query keys
 */
export const REVIEW_QUERY_KEYS = {
  teacher: (teacherId: string) => ['reviews', 'teacher', teacherId] as const,
  student: (studentId: string) => ['reviews', 'student', studentId] as const,
  byId: (reviewId: string) => ['reviews', 'detail', reviewId] as const,
  pending: (teacherId: string) => ['reviews', 'pending', teacherId] as const,
  all: () => ['reviews'] as const,
} as const

/**
 * User-related query keys
 */
export const USER_QUERY_KEYS = {
  current: () => ['user', 'current'] as const,
  profile: (userId: string) => ['user', 'profile', userId] as const,
  settings: (userId: string) => ['user', 'settings', userId] as const,
  all: () => ['user'] as const,
} as const

/**
 * Notification-related query keys
 */
export const NOTIFICATION_QUERY_KEYS = {
  list: (userId: string, filters?: Record<string, any>) => ['notifications', userId, filters] as const,
  unread: (userId: string) => ['notifications', 'unread', userId] as const,
  count: (userId: string) => ['notifications', 'count', userId] as const,
  all: (userId: string) => ['notifications', userId] as const,
} as const

/**
 * Package-related query keys
 */
export const PACKAGE_QUERY_KEYS = {
  list: (teacherId?: string) => ['packages', teacherId] as const,
  byId: (packageId: string) => ['packages', 'detail', packageId] as const,
  active: (teacherId: string) => ['packages', 'active', teacherId] as const,
  all: () => ['packages'] as const,
} as const

/**
 * Coupon-related query keys
 */
export const COUPON_QUERY_KEYS = {
  list: (teacherId: string) => ['coupons', teacherId] as const,
  byCode: (code: string) => ['coupons', 'code', code] as const,
  byId: (couponId: string) => ['coupons', 'detail', couponId] as const,
  active: (teacherId: string) => ['coupons', 'active', teacherId] as const,
  all: () => ['coupons'] as const,
} as const

/**
 * Invoice-related query keys
 */
export const INVOICE_QUERY_KEYS = {
  list: (filters?: Record<string, any>) => ['invoices', filters] as const,
  byId: (invoiceId: string) => ['invoices', 'detail', invoiceId] as const,
  student: (studentId: string) => ['invoices', 'student', studentId] as const,
  teacher: (teacherId: string) => ['invoices', 'teacher', teacherId] as const,
  pending: (teacherId: string) => ['invoices', 'pending', teacherId] as const,
  all: () => ['invoices'] as const,
} as const

/**
 * Category-related query keys
 */
export const CATEGORY_QUERY_KEYS = {
  list: () => ['categories'] as const,
  byId: (categoryId: string) => ['categories', 'detail', categoryId] as const,
  tree: () => ['categories', 'tree'] as const,
  all: () => ['categories'] as const,
} as const

/**
 * Wishlist-related query keys
 */
export const WISHLIST_QUERY_KEYS = {
  teachers: (userId: string) => ['wishlist', 'teachers', userId] as const,
  timeslots: (userId: string) => ['wishlist', 'timeslots', userId] as const,
  all: (userId: string) => ['wishlist', userId] as const,
} as const

/**
 * Financial-related query keys
 */
export const FINANCIAL_QUERY_KEYS = {
  summary: (teacherId: string, period?: string) => ['financial', 'summary', teacherId, period] as const,
  transactions: (teacherId: string, filters?: Record<string, any>) => ['financial', 'transactions', teacherId, filters] as const,
  revenue: (teacherId: string, timeRange: string) => ['financial', 'revenue', teacherId, timeRange] as const,
  all: (teacherId: string) => ['financial', teacherId] as const,
} as const

/**
 * Helper function to invalidate all queries for a specific entity
 */
export const getEntityQueryKeys = (entity: string): any => {
  const keyMap: Record<string, any> = {
    students: STUDENT_QUERY_KEYS,
    classes: CLASS_QUERY_KEYS,
    stats: STATS_QUERY_KEYS,
    credits: CREDIT_QUERY_KEYS,
    reviews: REVIEW_QUERY_KEYS,
    users: USER_QUERY_KEYS,
    notifications: NOTIFICATION_QUERY_KEYS,
    packages: PACKAGE_QUERY_KEYS,
    coupons: COUPON_QUERY_KEYS,
    invoices: INVOICE_QUERY_KEYS,
    categories: CATEGORY_QUERY_KEYS,
    wishlist: WISHLIST_QUERY_KEYS,
    financial: FINANCIAL_QUERY_KEYS,
  }
  
  return keyMap[entity] || null
}

/**
 * Type-safe query key factory
 * Use this to ensure query keys are properly typed
 */
export type QueryKeyFactory<T extends readonly unknown[]> = (...args: any[]) => T

/**
 * Export all query keys as a single object for convenience
 */
export const QUERY_KEYS = {
  students: STUDENT_QUERY_KEYS,
  classes: CLASS_QUERY_KEYS,
  stats: STATS_QUERY_KEYS,
  credits: CREDIT_QUERY_KEYS,
  reviews: REVIEW_QUERY_KEYS,
  users: USER_QUERY_KEYS,
  notifications: NOTIFICATION_QUERY_KEYS,
  packages: PACKAGE_QUERY_KEYS,
  coupons: COUPON_QUERY_KEYS,
  invoices: INVOICE_QUERY_KEYS,
  categories: CATEGORY_QUERY_KEYS,
  wishlist: WISHLIST_QUERY_KEYS,
  financial: FINANCIAL_QUERY_KEYS,
} as const

/**
 * Type exports for TypeScript support
 */
export type StudentQueryKeys = typeof STUDENT_QUERY_KEYS
export type ClassQueryKeys = typeof CLASS_QUERY_KEYS
export type StatsQueryKeys = typeof STATS_QUERY_KEYS
export type CreditQueryKeys = typeof CREDIT_QUERY_KEYS
export type ReviewQueryKeys = typeof REVIEW_QUERY_KEYS
export type UserQueryKeys = typeof USER_QUERY_KEYS
export type NotificationQueryKeys = typeof NOTIFICATION_QUERY_KEYS
export type PackageQueryKeys = typeof PACKAGE_QUERY_KEYS
export type CouponQueryKeys = typeof COUPON_QUERY_KEYS
export type InvoiceQueryKeys = typeof INVOICE_QUERY_KEYS
export type CategoryQueryKeys = typeof CATEGORY_QUERY_KEYS
export type WishlistQueryKeys = typeof WISHLIST_QUERY_KEYS
export type FinancialQueryKeys = typeof FINANCIAL_QUERY_KEYS
