/**
 * Management Routes Configuration
 * 
 * Defines routing structure for teacher dashboard management pages
 * integrating with existing Cyaxaress Laravel LMS structure
 */

export interface ManagementRoute {
  path: string
  title: string
  titleAr: string
  icon: string
  component: string
  permissions: string[]
  description?: string
}

export const MANAGEMENT_ROUTES: ManagementRoute[] = [
  {
    path: '/teacher/dashboard',
    title: 'Dashboard',
    titleAr: 'لوحة التحكم',
    icon: 'dashboard',
    component: 'TeacherDashboard',
    permissions: ['teacher', 'super-admin'],
    description: 'Main teacher dashboard with overview and quick actions',
  },
  {
    path: '/teacher/students',
    title: 'Student Management',
    titleAr: 'إدارة الطلاب',
    icon: 'users',
    component: 'StudentManagementPage',
    permissions: ['teacher', 'super-admin'],
    description: 'Manage students, view profiles, track progress',
  },
  {
    path: '/teacher/classes',
    title: 'Class Management',
    titleAr: 'إدارة الحصص',
    icon: 'calendar',
    component: 'ClassManagementPage',
    permissions: ['teacher', 'super-admin'],
    description: 'Schedule and manage English lessons',
  },
  {
    path: '/teacher/reviews',
    title: 'Reviews',
    titleAr: 'المراجعات',
    icon: 'star',
    component: 'ReviewsManagementPage',
    permissions: ['teacher', 'super-admin'],
    description: 'View and respond to student reviews',
  },
  {
    path: '/teacher/statistics',
    title: 'Statistics',
    titleAr: 'الإحصائيات',
    icon: 'chart',
    component: 'StatisticsPage',
    permissions: ['teacher', 'super-admin'],
    description: 'Analytics and performance metrics',
  },
  {
    path: '/teacher/financial',
    title: 'Financial Management',
    titleAr: 'الشؤون المالية',
    icon: 'money',
    component: 'FinancialManagementPage',
    permissions: ['teacher', 'super-admin'],
    description: 'Track income, expenses, and financial reports',
  },
  {
    path: '/teacher/credits',
    title: 'Credit Management',
    titleAr: 'إدارة الرصيد',
    icon: 'money',
    component: 'CreditManagementPage',
    permissions: ['teacher', 'super-admin'],
    description: 'Add and manage student credits',
  },
  {
    path: '/teacher/users',
    title: 'User Management',
    titleAr: 'إدارة المستخدمين',
    icon: 'users',
    component: 'UserManagementPage',
    permissions: ['teacher', 'super-admin'],
    description: 'Manage users and permissions',
  },
]

export const STUDENT_ROUTES: ManagementRoute[] = [
  {
    path: '/student/dashboard',
    title: 'Dashboard',
    titleAr: 'لوحة التحكم',
    icon: 'dashboard',
    component: 'StudentDashboard',
    permissions: ['student'],
    description: 'Student dashboard with classes and progress',
  },
  {
    path: '/student/classes',
    title: 'My Classes',
    titleAr: 'حصصي',
    icon: 'calendar',
    component: 'StudentClassesPage',
    permissions: ['student'],
    description: 'View and manage enrolled classes',
  },
  {
    path: '/student/progress',
    title: 'Progress',
    titleAr: 'التقدم',
    icon: 'chart',
    component: 'StudentProgressPage',
    permissions: ['student'],
    description: 'Track learning progress and achievements',
  },
]

/**
 * Get routes for a specific role
 */
export function getRoutesForRole(role: 'teacher' | 'student' | 'super-admin'): ManagementRoute[] {
  if (role === 'teacher' || role === 'super-admin') {
    return MANAGEMENT_ROUTES.filter(route => route.permissions.includes(role))
  }
  if (role === 'student') {
    return STUDENT_ROUTES
  }
  return []
}

/**
 * Check if user has permission to access a route
 */
export function hasRoutePermission(route: ManagementRoute, userRole: string): boolean {
  return route.permissions.includes(userRole)
}

/**
 * Get route by path
 */
export function getRouteByPath(path: string): ManagementRoute | undefined {
  return [...MANAGEMENT_ROUTES, ...STUDENT_ROUTES].find(route => route.path === path)
}

/**
 * Navigation breadcrumbs helper
 */
export interface Breadcrumb {
  title: string
  titleAr: string
  path: string
}

export function getBreadcrumbs(currentPath: string): Breadcrumb[] {
  const breadcrumbs: Breadcrumb[] = []
  
  // Add home/dashboard
  if (currentPath.startsWith('/teacher')) {
    breadcrumbs.push({
      title: 'Dashboard',
      titleAr: 'لوحة التحكم',
      path: '/teacher/dashboard',
    })
  } else if (currentPath.startsWith('/student')) {
    breadcrumbs.push({
      title: 'Dashboard',
      titleAr: 'لوحة التحكم',
      path: '/student/dashboard',
    })
  }
  
  // Add current page if not dashboard
  const route = getRouteByPath(currentPath)
  if (route && route.path !== breadcrumbs[0]?.path) {
    breadcrumbs.push({
      title: route.title,
      titleAr: route.titleAr,
      path: route.path,
    })
  }
  
  return breadcrumbs
}

export default {
  MANAGEMENT_ROUTES,
  STUDENT_ROUTES,
  getRoutesForRole,
  hasRoutePermission,
  getRouteByPath,
  getBreadcrumbs,
}
