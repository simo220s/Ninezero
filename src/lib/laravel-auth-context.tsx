import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { apiClient, TokenManager } from './apiClient'
import type { AuthUser, AuthResponse } from '@/types/api'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signUp: (email: string, password: string, userData: { name: string; mobile?: string; role?: string }) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<{ error: any }>
  getUserRole: () => 'teacher' | 'student' | 'admin'
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Role detection helpers
const TEACHER_EMAIL = 'selem.vet@gmail.com'
const ADMIN_EMAIL = 'admin@saudienglishclub.com'

export function LaravelAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch current user on mount
  useEffect(() => {
    logger.log('[Laravel Auth] Initializing auth context')
    fetchCurrentUser()
  }, [])

  const fetchCurrentUser = async () => {
    const token = TokenManager.getAccessToken()
    
    if (!token) {
      logger.log('[Laravel Auth] No access token found')
      setLoading(false)
      return
    }

    try {
      logger.log('[Laravel Auth] Fetching current user')
      const userData = await apiClient.get<AuthUser>('/auth/me')
      logger.log('[Laravel Auth] User fetched:', userData.id)
      setUser(userData)
    } catch (error) {
      logger.error('[Laravel Auth] Error fetching user:', error)
      // Token invalid or expired - will be handled by apiClient
      setUser(null)
      TokenManager.clearTokens()
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, userData: { name: string; mobile?: string; role?: string }) => {
    try {
      logger.log('[Laravel Auth] Starting signup process for:', email)
      
      const response = await apiClient.post<AuthResponse>('/auth/register', {
        email,
        password,
        name: userData.name,
        mobile: userData.mobile,
        role: userData.role || 'student',
      })

      logger.log('[Laravel Auth] Signup successful, user created:', response.user.id)
      
      // Store tokens
      TokenManager.setTokens(response.accessToken, response.refreshToken, response.expires_at)
      
      // Set user
      setUser(response.user)

      return { error: null }
    } catch (error: any) {
      logger.error('[Laravel Auth] Signup error:', error)
      return { 
        error: { 
          message: error.message || 'Signup failed',
          details: error.data?.details 
        } 
      }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      logger.log('[Laravel Auth] Starting sign in process for:', email)
      
      const response = await apiClient.post<AuthResponse>('/auth/login', {
        email,
        password,
      })

      logger.log('[Laravel Auth] Sign in successful, user:', response.user.id)
      
      // Store tokens
      TokenManager.setTokens(response.accessToken, response.refreshToken, response.expires_at)
      
      // Set user
      setUser(response.user)

      return { error: null }
    } catch (error: any) {
      logger.error('[Laravel Auth] Sign in error:', error)
      return { 
        error: { 
          message: error.message || 'Sign in failed' 
        } 
      }
    }
  }

  const signOut = async () => {
    try {
      logger.log('[Laravel Auth] Starting sign out process')
      
      // Call logout endpoint (will revoke token on backend)
      await apiClient.post('/auth/logout')
      
      // Clear local tokens
      TokenManager.clearTokens()
      
      // Clear user
      setUser(null)
      
      logger.log('[Laravel Auth] Sign out successful')
      return { error: null }
    } catch (error: any) {
      logger.error('[Laravel Auth] Sign out error:', error)
      
      // Even if API call fails, clear local state
      TokenManager.clearTokens()
      setUser(null)
      
      return { error: null } // Don't return error for logout
    }
  }

  const getUserRole = (): 'teacher' | 'student' | 'admin' => {
    if (!user) return 'student'
    
    // Use role from backend if available
    if (user.role) {
      return user.role
    }
    
    // Fallback to email-based detection
    if (user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) return 'admin'
    if (user.email?.toLowerCase() === TEACHER_EMAIL.toLowerCase()) return 'teacher'
    
    return 'student'
  }

  const refreshUser = async () => {
    await fetchCurrentUser()
  }

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    getUserRole,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useLaravelAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useLaravelAuth must be used within a LaravelAuthProvider')
  }
  return context
}

