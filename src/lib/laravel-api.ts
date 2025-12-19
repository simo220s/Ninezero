/**
 * Laravel API Integration Layer
 * Provides typed functions for interacting with the Laravel backend
 */

import { apiClient } from './apiClient'
import type {
  DashboardStats,
  UserListResponse,
  StudentClassesResponse,
  TeacherClassesResponse,
  StudentCredits,
  NotificationsResponse,
  ReviewSubmission,
  ReviewResponse,
  StudentInfo,
} from '@/types/api'

// Admin API
export const adminApi = {
  /**
   * Get dashboard statistics
   */
  async getStats(): Promise<DashboardStats> {
    return apiClient.get<DashboardStats>('/admin/dashboard/stats')
  },

  /**
   * Get all users with filters
   */
  async getUsers(params?: {
    page?: number
    limit?: number
    role?: 'student' | 'teacher' | 'admin'
    search?: string
  }): Promise<UserListResponse> {
    return apiClient.get<UserListResponse>('/admin/users', params)
  },

  /**
   * Create a new user
   */
  async createUser(data: {
    email: string
    password: string
    name: string
    mobile?: string
    role: 'student' | 'teacher' | 'admin'
  }) {
    return apiClient.post('/admin/users', data)
  },

  /**
   * Update user
   */
  async updateUser(id: string, data: {
    name?: string
    mobile?: string
    role?: 'student' | 'teacher' | 'admin'
  }) {
    return apiClient.put(`/admin/users/${id}`, data)
  },

  /**
   * Delete user
   */
  async deleteUser(id: string) {
    return apiClient.delete(`/admin/users/${id}`)
  },

  /**
   * Adjust user credits
   */
  async adjustCredits(id: string, amount: number, reason: string) {
    return apiClient.post(`/admin/users/${id}/adjust-credits`, { amount, reason })
  },
}

// Teacher API
export const teacherApi = {
  /**
   * Get teacher's classes
   */
  async getClasses(params?: {
    status?: string
    start_date?: string
    end_date?: string
  }): Promise<TeacherClassesResponse> {
    return apiClient.get<TeacherClassesResponse>('/teacher/classes', params)
  },

  /**
   * Create a new class
   */
  async createClass(data: {
    title: string
    season_id: string
    time?: number
    body?: string
    slug?: string
  }) {
    return apiClient.post('/teacher/classes', data)
  },

  /**
   * Get teacher's students
   */
  async getStudents(): Promise<{ students: StudentInfo[] }> {
    return apiClient.get<{ students: StudentInfo[] }>('/teacher/students')
  },
}

// Student API
export const studentApi = {
  /**
   * Get student's classes
   */
  async getClasses(): Promise<StudentClassesResponse> {
    return apiClient.get<StudentClassesResponse>('/student/classes')
  },

  /**
   * Get credit balance
   */
  async getCredits(): Promise<StudentCredits> {
    return apiClient.get<StudentCredits>('/student/credits')
  },

  /**
   * Submit a review
   */
  async submitReview(data: ReviewSubmission): Promise<ReviewResponse> {
    return apiClient.post<ReviewResponse>('/student/reviews', data)
  },
}

// Notification API
export const notificationApi = {
  /**
   * Get user notifications
   */
  async getNotifications(unreadOnly?: boolean): Promise<NotificationsResponse> {
    return apiClient.get<NotificationsResponse>('/notifications', {
      unread_only: unreadOnly?.toString(),
    })
  },

  /**
   * Mark notification as read
   */
  async markAsRead(id: string) {
    return apiClient.put(`/notifications/${id}/read`)
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead() {
    return apiClient.put('/notifications/read-all')
  },
}

// Export all APIs as a single object
export const laravelApi = {
  admin: adminApi,
  teacher: teacherApi,
  student: studentApi,
  notifications: notificationApi,
}

