/**
 * Cyaxaress Laravel LMS Integration Layer
 * 
 * This module provides integration with the existing Cyaxaress Laravel LMS
 * located at C:\Users\Administrator\Desktop\lms-master
 * 
 * It bridges the React/TypeScript frontend with the Laravel backend's
 * modular structure (User, Course, Payment, Dashboard modules)
 */

import { logger } from '../logger'

// Base configuration for Laravel API
const LARAVEL_API_BASE_URL = import.meta.env.VITE_LARAVEL_API_URL || 'http://localhost:8000/api'

// API Client with authentication
class CyaxaressApiClient {
  private baseUrl: string
  private authToken: string | null = null

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  setAuthToken(token: string) {
    this.authToken = token
  }

  clearAuthToken() {
    this.authToken = null
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ data: T | null; error: any }> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }

      if (this.authToken) {
        headers['Authorization'] = `Bearer ${this.authToken}`
      }
      
      // Merge with any additional headers from options
      if (options.headers) {
        Object.assign(headers, options.headers)
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return { data, error: null }
    } catch (error) {
      logger.error('Cyaxaress API Error:', error)
      return { data: null, error }
    }
  }

  async get<T>(endpoint: string): Promise<{ data: T | null; error: any }> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, body: any): Promise<{ data: T | null; error: any }> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }

  async put<T>(endpoint: string, body: any): Promise<{ data: T | null; error: any }> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    })
  }

  async delete<T>(endpoint: string): Promise<{ data: T | null; error: any }> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

// Create singleton instance
export const cyaxaressApi = new CyaxaressApiClient(LARAVEL_API_BASE_URL)

// Type definitions matching Cyaxaress Laravel models

export interface CyaxaressUser {
  id: number
  name: string
  email: string
  mobile: string | null
  image_id: number | null
  email_verified_at: string | null
  created_at: string
  updated_at: string
  roles: CyaxaressRole[]
}

export interface CyaxaressRole {
  id: number
  name: string // 'super-admin' | 'teacher' | 'student'
  guard_name: string
}

export interface CyaxaressCourse {
  id: number
  teacher_id: number
  title: string
  slug: string
  price: number
  type: 'free' | 'cash'
  status: 'completed' | 'not-completed' | 'locked'
  confirmation_status: 'accepted' | 'pending' | 'rejected'
  banner_id: number | null
  category_id: number | null
  created_at: string
  updated_at: string
  teacher?: CyaxaressUser
  students?: CyaxaressUser[]
}

export interface CyaxaressLesson {
  id: number
  course_id: number
  season_id: number | null
  user_id: number
  media_id: number | null
  title: string
  slug: string
  time: number // duration in seconds
  free: boolean
  status: 'opened' | 'locked'
  confirmation_status: 'accepted' | 'pending' | 'rejected'
  created_at: string
  updated_at: string
}

export interface CyaxaressPayment {
  id: number
  buyer_id: number
  paymentable_id: number
  paymentable_type: string
  amount: number
  invoice_id: string | null
  gateway: string
  status: string
  created_at: string
  updated_at: string
}

export interface CyaxaressSettlement {
  id: number
  user_id: number
  amount: number
  from: string
  to: string
  status: string
  created_at: string
  updated_at: string
}

// User Module Integration
export const CyaxaressUserApi = {
  /**
   * Get all users with optional role filter
   */
  async getUsers(role?: 'teacher' | 'student'): Promise<{ data: CyaxaressUser[] | null; error: any }> {
    const endpoint = role ? `/users?role=${role}` : '/users'
    return cyaxaressApi.get<CyaxaressUser[]>(endpoint)
  },

  /**
   * Get user by ID
   */
  async getUser(userId: number): Promise<{ data: CyaxaressUser | null; error: any }> {
    return cyaxaressApi.get<CyaxaressUser>(`/users/${userId}`)
  },

  /**
   * Get students for a teacher
   */
  async getTeacherStudents(teacherId: number): Promise<{ data: CyaxaressUser[] | null; error: any }> {
    return cyaxaressApi.get<CyaxaressUser[]>(`/teachers/${teacherId}/students`)
  },

  /**
   * Update user profile
   */
  async updateUser(userId: number, data: Partial<CyaxaressUser>): Promise<{ data: CyaxaressUser | null; error: any }> {
    return cyaxaressApi.put<CyaxaressUser>(`/users/${userId}`, data)
  },
}

// Course Module Integration
export const CyaxaressCourseApi = {
  /**
   * Get all courses for a teacher
   */
  async getTeacherCourses(teacherId: number): Promise<{ data: CyaxaressCourse[] | null; error: any }> {
    return cyaxaressApi.get<CyaxaressCourse[]>(`/teachers/${teacherId}/courses`)
  },

  /**
   * Get course by ID
   */
  async getCourse(courseId: number): Promise<{ data: CyaxaressCourse | null; error: any }> {
    return cyaxaressApi.get<CyaxaressCourse>(`/courses/${courseId}`)
  },

  /**
   * Create a new course (lesson)
   */
  async createCourse(data: {
    title: string
    teacher_id: number
    price: number
    type: 'free' | 'cash'
  }): Promise<{ data: CyaxaressCourse | null; error: any }> {
    return cyaxaressApi.post<CyaxaressCourse>('/courses', data)
  },

  /**
   * Get lessons for a course
   */
  async getCourseLessons(courseId: number): Promise<{ data: CyaxaressLesson[] | null; error: any }> {
    return cyaxaressApi.get<CyaxaressLesson[]>(`/courses/${courseId}/lessons`)
  },

  /**
   * Create a new lesson
   */
  async createLesson(data: {
    course_id: number
    title: string
    time: number
  }): Promise<{ data: CyaxaressLesson | null; error: any }> {
    return cyaxaressApi.post<CyaxaressLesson>('/lessons', data)
  },
}

// Payment Module Integration
export const CyaxaressPaymentApi = {
  /**
   * Get payments for a user
   */
  async getUserPayments(userId: number): Promise<{ data: CyaxaressPayment[] | null; error: any }> {
    return cyaxaressApi.get<CyaxaressPayment[]>(`/users/${userId}/payments`)
  },

  /**
   * Get teacher settlements
   */
  async getTeacherSettlements(teacherId: number): Promise<{ data: CyaxaressSettlement[] | null; error: any }> {
    return cyaxaressApi.get<CyaxaressSettlement[]>(`/teachers/${teacherId}/settlements`)
  },

  /**
   * Get payment statistics for a teacher
   */
  async getTeacherPaymentStats(teacherId: number): Promise<{ 
    data: {
      total_income: number
      monthly_income: number
      pending_settlements: number
      completed_payments: number
    } | null
    error: any 
  }> {
    return cyaxaressApi.get(`/teachers/${teacherId}/payment-stats`)
  },
}

// Dashboard Module Integration
export const CyaxaressDashboardApi = {
  /**
   * Get teacher dashboard statistics
   */
  async getTeacherStats(teacherId: number): Promise<{
    data: {
      total_students: number
      active_courses: number
      total_lessons: number
      total_earnings: number
      this_month_earnings: number
      pending_reviews: number
    } | null
    error: any
  }> {
    return cyaxaressApi.get(`/dashboard/teacher/${teacherId}/stats`)
  },

  /**
   * Get student dashboard statistics
   */
  async getStudentStats(studentId: number): Promise<{
    data: {
      enrolled_courses: number
      completed_lessons: number
      in_progress_lessons: number
      certificates_earned: number
    } | null
    error: any
  }> {
    return cyaxaressApi.get(`/dashboard/student/${studentId}/stats`)
  },
}

// Authentication helpers
export const CyaxaressAuth = {
  /**
   * Set authentication token for API requests
   */
  setToken(token: string) {
    cyaxaressApi.setAuthToken(token)
    // Store in localStorage for persistence
    localStorage.setItem('cyaxaress_auth_token', token)
  },

  /**
   * Clear authentication token
   */
  clearToken() {
    cyaxaressApi.clearAuthToken()
    localStorage.removeItem('cyaxaress_auth_token')
  },

  /**
   * Load token from storage
   */
  loadToken() {
    const token = localStorage.getItem('cyaxaress_auth_token')
    if (token) {
      cyaxaressApi.setAuthToken(token)
    }
    return token
  },
}

// Initialize auth token on module load
CyaxaressAuth.loadToken()

export default {
  User: CyaxaressUserApi,
  Course: CyaxaressCourseApi,
  Payment: CyaxaressPaymentApi,
  Dashboard: CyaxaressDashboardApi,
  Auth: CyaxaressAuth,
}
