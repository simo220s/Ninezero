/**
 * Enhanced Authentication Service
 * Provides comprehensive authentication flow with error handling,
 * session management, and automatic refresh
 */

import { supabase } from '@/lib/supabase'
import { type User, type Session, type AuthError } from '@supabase/supabase-js'
import { errorService } from './error-service'
import { logger } from '@/lib/utils/logger'
import { generateReferralCode } from '@/lib/utils'

/**
 * Authentication result interface
 */
export interface AuthResult {
  success: boolean
  user?: User
  session?: Session
  error?: AuthError | Error | null
  requiresEmailVerification?: boolean
}

/**
 * Signup data interface
 */
export interface SignupData {
  email: string
  password: string
  name: string
  referralCode?: string
}

/**
 * Session refresh result
 */
export interface SessionRefreshResult {
  success: boolean
  session?: Session
  error?: AuthError | Error | null
}

/**
 * Enhanced Authentication Service
 */
class AuthService {
  private refreshTimer: NodeJS.Timeout | null = null
  private readonly SESSION_REFRESH_INTERVAL = 5 * 60 * 1000 // 5 minutes
  private readonly SESSION_EXPIRY_BUFFER = 10 * 60 // 10 minutes before expiry

  /**
   * Sign up a new user with comprehensive error handling
   */
  async signUp(data: SignupData): Promise<AuthResult> {
    try {
      logger.info('[AuthService] Starting signup process', { 
        component: 'AuthService',
        metadata: { email: data.email }
      })

      // Split name into first and last name
      const nameParts = data.name.trim().split(' ')
      const firstName = nameParts[0] || data.name
      const lastName = nameParts.slice(1).join(' ') || ''

      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            first_name: firstName,
            last_name: lastName,
            referral_code: data.referralCode,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        logger.error('[AuthService] Signup error', error)
        await errorService.handle(error, {
          showToast: false,
          context: { operation: 'signup', email: data.email },
        })
        return { success: false, error }
      }

      if (!authData.user) {
        const error = new Error('No user data returned from signup')
        logger.error('[AuthService] No user data returned', error)
        return { success: false, error }
      }

      logger.info('[AuthService] Signup successful', { userId: authData.user.id })

      // Create user profile and credits
      await this.createUserProfile(authData.user, {
        name: data.name,
        firstName,
        lastName,
        referralCode: data.referralCode,
      })

      // Verify session was created
      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData.session) {
        logger.warn('[AuthService] Session not created after signup')
        return {
          success: false,
          error: new Error('Failed to create session after signup'),
        }
      }

      logger.info('[AuthService] Session verified after signup')

      // Start session refresh timer
      this.startSessionRefresh()

      return {
        success: true,
        user: authData.user,
        session: sessionData.session,
      }
    } catch (error) {
      logger.error('[AuthService] Unexpected signup error', error as Error)
      await errorService.handle(error, {
        showToast: false,
        context: { operation: 'signup' },
      })
      return {
        success: false,
        error: error as Error,
      }
    }
  }

  /**
   * Sign in a user with comprehensive error handling
   */
  async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      logger.info('[AuthService] Starting sign in process', {
        component: 'AuthService',
        metadata: { email }
      })

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        logger.error('[AuthService] Sign in error', error)
        await errorService.handle(error, {
          showToast: false,
          context: { operation: 'signin', email },
        })
        return { success: false, error }
      }

      if (!data.user || !data.session) {
        const error = new Error('No user or session data returned from sign in')
        logger.error('[AuthService] No user/session data returned', error)
        return { success: false, error }
      }

      logger.info('[AuthService] Sign in successful', { userId: data.user.id })

      // Start session refresh timer
      this.startSessionRefresh()

      return {
        success: true,
        user: data.user,
        session: data.session,
      }
    } catch (error) {
      logger.error('[AuthService] Unexpected sign in error', error as Error)
      await errorService.handle(error, {
        showToast: false,
        context: { operation: 'signin' },
      })
      return {
        success: false,
        error: error as Error,
      }
    }
  }

  /**
   * Sign out a user with cleanup
   */
  async signOut(): Promise<AuthResult> {
    try {
      logger.info('[AuthService] Starting sign out process')

      // Stop session refresh timer
      this.stopSessionRefresh()

      const { error } = await supabase.auth.signOut()

      if (error) {
        logger.error('[AuthService] Sign out error', error)
        await errorService.handle(error, {
          showToast: false,
          context: { operation: 'signout' },
        })
        return { success: false, error }
      }

      logger.info('[AuthService] Sign out successful')
      return { success: true }
    } catch (error) {
      logger.error('[AuthService] Unexpected sign out error', error as Error)
      await errorService.handle(error, {
        showToast: false,
        context: { operation: 'signout' },
      })
      return {
        success: false,
        error: error as Error,
      }
    }
  }

  /**
   * Reset password for a user
   */
  async resetPassword(email: string): Promise<AuthResult> {
    try {
      logger.info('[AuthService] Starting password reset', {
        component: 'AuthService',
        metadata: { email }
      })

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        logger.error('[AuthService] Password reset error', error)
        await errorService.handle(error, {
          showToast: false,
          context: { operation: 'resetPassword', email },
        })
        return { success: false, error }
      }

      logger.info('[AuthService] Password reset email sent successfully')
      return { success: true }
    } catch (error) {
      logger.error('[AuthService] Unexpected password reset error', error as Error)
      await errorService.handle(error, {
        showToast: false,
        context: { operation: 'resetPassword' },
      })
      return {
        success: false,
        error: error as Error,
      }
    }
  }

  /**
   * Update password for authenticated user
   */
  async updatePassword(newPassword: string): Promise<AuthResult> {
    try {
      logger.info('[AuthService] Starting password update')

      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) {
        logger.error('[AuthService] Password update error', error)
        await errorService.handle(error, {
          showToast: false,
          context: { operation: 'updatePassword' },
        })
        return { success: false, error }
      }

      logger.info('[AuthService] Password updated successfully')
      return { success: true, user: data.user }
    } catch (error) {
      logger.error('[AuthService] Unexpected password update error', error as Error)
      await errorService.handle(error, {
        showToast: false,
        context: { operation: 'updatePassword' },
      })
      return {
        success: false,
        error: error as Error,
      }
    }
  }

  /**
   * Refresh the current session
   */
  async refreshSession(): Promise<SessionRefreshResult> {
    try {
      logger.debug('[AuthService] Refreshing session')

      const { data, error } = await supabase.auth.refreshSession()

      if (error) {
        logger.error('[AuthService] Session refresh error', error)
        
        // If refresh fails, user needs to re-authenticate
        if (error.message?.includes('refresh_token_not_found') || 
            error.message?.includes('invalid_grant')) {
          logger.warn('[AuthService] Session expired, redirecting to login')
          this.handleExpiredSession()
        }

        return { success: false, error }
      }

      if (!data.session) {
        logger.warn('[AuthService] No session returned from refresh')
        return {
          success: false,
          error: new Error('No session returned from refresh'),
        }
      }

      logger.debug('[AuthService] Session refreshed successfully')
      return { success: true, session: data.session }
    } catch (error) {
      logger.error('[AuthService] Unexpected session refresh error', error as Error)
      return {
        success: false,
        error: error as Error,
      }
    }
  }

  /**
   * Get the current session
   */
  async getSession(): Promise<Session | null> {
    try {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        logger.error('[AuthService] Error getting session', error)
        return null
      }

      return data.session
    } catch (error) {
      logger.error('[AuthService] Unexpected error getting session', error as Error)
      return null
    }
  }

  /**
   * Check if session is expired or about to expire
   */
  async isSessionExpired(): Promise<boolean> {
    const session = await this.getSession()
    
    if (!session) {
      return true
    }

    const expiresAt = session.expires_at
    if (!expiresAt) {
      return false
    }

    const now = Math.floor(Date.now() / 1000)
    const timeUntilExpiry = expiresAt - now

    // Consider expired if less than buffer time remaining
    return timeUntilExpiry < this.SESSION_EXPIRY_BUFFER
  }

  /**
   * Start automatic session refresh
   */
  private startSessionRefresh(): void {
    // Clear any existing timer
    this.stopSessionRefresh()

    logger.debug('[AuthService] Starting session refresh timer')

    this.refreshTimer = setInterval(async () => {
      const isExpired = await this.isSessionExpired()
      
      if (isExpired) {
        logger.info('[AuthService] Session expired or expiring soon, refreshing')
        const result = await this.refreshSession()
        
        if (!result.success) {
          logger.error('[AuthService] Failed to refresh session')
          this.stopSessionRefresh()
        }
      }
    }, this.SESSION_REFRESH_INTERVAL)
  }

  /**
   * Stop automatic session refresh
   */
  private stopSessionRefresh(): void {
    if (this.refreshTimer) {
      logger.debug('[AuthService] Stopping session refresh timer')
      clearInterval(this.refreshTimer)
      this.refreshTimer = null
    }
  }

  /**
   * Handle expired session
   */
  private handleExpiredSession(): void {
    logger.warn('[AuthService] Handling expired session')
    
    // Stop refresh timer
    this.stopSessionRefresh()

    // Store current location for redirect after login
    const currentPath = window.location.pathname
    if (currentPath !== '/login' && currentPath !== '/signup') {
      sessionStorage.setItem('redirectAfterLogin', currentPath)
    }

    // Redirect to login
    window.location.href = '/login'
  }

  /**
   * Create user profile and initial data
   */
  private async createUserProfile(
    user: User,
    userData: {
      name: string
      firstName: string
      lastName: string
      referralCode?: string
    }
  ): Promise<void> {
    try {
      logger.info('[AuthService] Creating user profile', { userId: user.id })

      // Generate referral code
      const referralCode = generateReferralCode()

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email!,
          first_name: userData.firstName,
          last_name: userData.lastName,
          referral_code: referralCode,
        })

      if (profileError) {
        logger.error('[AuthService] Error creating profile', profileError)
        throw profileError
      }

      // Create class credits with 0.5 trial credit
      const { error: creditsError } = await supabase
        .from('class_credits')
        .insert({
          user_id: user.id,
          credits: 0.5,
        })

      if (creditsError) {
        logger.error('[AuthService] Error creating credits', creditsError)
        throw creditsError
      }

      // Create student record
      const { error: studentError } = await supabase
        .from('students')
        .insert({
          user_id: user.id,
          name: userData.name,
          email: user.email!,
          age: 12, // Default age
          level: 'beginner', // Default level
          is_trial: true,
        })

      if (studentError) {
        logger.error('[AuthService] Error creating student record', studentError)
        throw studentError
      }

      // Handle referral if provided
      if (userData.referralCode) {
        await this.handleReferral(user.id, userData.referralCode)
      }

      logger.info('[AuthService] User profile created successfully')
    } catch (error) {
      logger.error('[AuthService] Error creating user profile', error as Error)
      // Don't throw - profile creation failure shouldn't block signup
    }
  }

  /**
   * Handle referral code
   */
  private async handleReferral(newUserId: string, referralCode: string): Promise<void> {
    try {
      logger.info('[AuthService] Processing referral', {
        component: 'AuthService',
        metadata: { referralCode }
      })

      // Find referrer by code
      const { data: referrer, error: referrerError } = await supabase
        .from('profiles')
        .select('id')
        .eq('referral_code', referralCode)
        .single()

      if (referrerError || !referrer) {
        logger.warn('[AuthService] Referrer not found', {
          component: 'AuthService',
          metadata: { referralCode }
        })
        return
      }

      // Create referral record
      const { error: referralError } = await supabase
        .from('referrals')
        .insert({
          referrer_user_id: referrer.id,
          referred_user_id: newUserId,
          referral_code: referralCode,
          status: 'pending',
          credits_awarded: 0.25,
        })

      if (referralError) {
        logger.error('[AuthService] Error creating referral record', referralError)
        throw referralError
      }

      // Award immediate 0.25 credits to referrer
      const { error: creditError } = await supabase.rpc('add_credits', {
        user_id: referrer.id,
        amount: 0.25,
      })

      if (creditError) {
        logger.error('[AuthService] Error awarding referral credits', creditError)
        throw creditError
      }

      logger.info('[AuthService] Referral processed successfully')
    } catch (error) {
      logger.error('[AuthService] Error handling referral', error as Error)
      // Don't throw - referral failure shouldn't block signup
    }
  }

  /**
   * Get redirect path after login
   */
  getRedirectAfterLogin(): string | null {
    const redirect = sessionStorage.getItem('redirectAfterLogin')
    if (redirect) {
      sessionStorage.removeItem('redirectAfterLogin')
    }
    return redirect
  }
}

// Export singleton instance
export const authService = new AuthService()
