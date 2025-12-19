/**
 * API Response Types for Laravel Backend
 */

// Auth Types
export interface AuthUser {
  id: string
  email: string
  name: string
  role: 'student' | 'teacher' | 'admin'
  mobile?: string
  created_at?: string
}

export interface AuthResponse {
  user: AuthUser
  accessToken: string
  refreshToken: string
  token_type: string
  expires_at?: string
}

export interface RefreshTokenResponse {
  accessToken: string
  refreshToken: string
  token_type: string
  expires_at?: string
}

// Admin Dashboard Types
export interface DashboardStats {
  totalUsers: number
  totalStudents: number
  totalTeachers: number
  totalAdmins: number
  totalCourses?: number
  publishedCourses?: number
  totalPayments?: number
  totalRevenue?: number
}

export interface UserListItem {
  id: string
  email: string
  name: string
  mobile?: string
  role: 'student' | 'teacher' | 'admin'
  created_at: string
}

export interface UserListResponse {
  users: UserListItem[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Class/Course Types
export interface ClassItem {
  id: string
  title: string
  teacher_name?: string
  teacher_id?: string
  duration?: number
  status: string
  created_at: string
  course_title?: string
  purchased_at?: string
  total_lessons?: number
}

export interface StudentClassesResponse {
  upcoming: ClassItem[]
  history: ClassItem[]
}

export interface TeacherClassesResponse {
  classes: ClassItem[]
}

// Student Types
export interface StudentCredits {
  credits: number
  is_trial: boolean
  trial_credits: number
  message?: string
}

export interface StudentInfo {
  id: string
  name: string
  email: string
  mobile?: string
  enrolled_courses?: number
}

// Notification Types
export interface Notification {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  created_at: string
  metadata?: Record<string, any>
}

export interface NotificationsResponse {
  notifications: Notification[]
  unreadCount: number
}

// Review Types
export interface ReviewSubmission {
  course_id: string
  rating: number
  comment: string
}

export interface ReviewResponse {
  id: string
  rating: number
  comment: string
  approved: boolean
  created_at: string
}

// Error Response
export interface ErrorResponse {
  error: string
  message?: string
  details?: any
}

