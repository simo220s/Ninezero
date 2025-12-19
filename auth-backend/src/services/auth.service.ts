import { userService, UserProfile } from './user.service';
import { tokenService, TokenPayload } from './token.service';
import { getSupabaseClient } from '../config/supabase';
import crypto from 'crypto';

export interface RegisterDTO {
  email: string;
  password: string;
  name: string;
  role?: string;
}

export interface AuthResponse {
  user: UserProfile;
  accessToken: string;
  refreshToken: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken?: string;
}

class AuthService {
  /**
   * Register new user
   */
  async register(data: RegisterDTO): Promise<AuthResponse> {
    try {
      // Check if email already exists
      const existingUser = await userService.findUserByEmail(data.email);
      if (existingUser) {
        throw new Error('EMAIL_EXISTS');
      }

      // Split name into first and last name
      const nameParts = data.name.trim().split(' ');
      const firstName = nameParts[0] || data.name;
      const lastName = nameParts.slice(1).join(' ') || '';

      // Create user
      const user = await userService.createUser({
        email: data.email,
        password: data.password,
        firstName: firstName,
        lastName: lastName,
        role: data.role || 'student',
      });

      // Generate tokens
      const tokenPayload: TokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      const accessToken = tokenService.generateAccessToken(tokenPayload);
      const refreshToken = tokenService.generateRefreshToken(tokenPayload);

      // Generate email verification token
      await this.generateEmailVerificationToken(user.id);

      return {
        user: userService.toUserProfile(user),
        accessToken,
        refreshToken,
      };
    } catch (error) {
      if (error instanceof Error && error.message === 'EMAIL_EXISTS') {
        throw error;
      }
      console.error('Error during registration:', error);
      throw new Error('Registration failed');
    }
  }

  /**
   * Login user
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      // Find user by email
      const user = await userService.findUserByEmail(email);
      if (!user) {
        throw new Error('INVALID_CREDENTIALS');
      }

      // Verify password
      const isPasswordValid = await userService.verifyPassword(
        password,
        user.password_hash
      );
      if (!isPasswordValid) {
        throw new Error('INVALID_CREDENTIALS');
      }

      // Generate tokens
      const tokenPayload: TokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      const accessToken = tokenService.generateAccessToken(tokenPayload);
      const refreshToken = tokenService.generateRefreshToken(tokenPayload);

      return {
        user: userService.toUserProfile(user),
        accessToken,
        refreshToken,
      };
    } catch (error) {
      if (error instanceof Error && error.message === 'INVALID_CREDENTIALS') {
        throw error;
      }
      console.error('Error during login:', error);
      throw new Error('Login failed');
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    try {
      // Verify refresh token
      const decoded = tokenService.verifyRefreshToken(refreshToken);

      // Check if token is blacklisted
      const isBlacklisted = await tokenService.isTokenBlacklisted(refreshToken);
      if (isBlacklisted) {
        throw new Error('TOKEN_INVALID');
      }

      // Generate new access token
      const tokenPayload: TokenPayload = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      };

      const newAccessToken = tokenService.generateAccessToken(tokenPayload);

      // Check if refresh token is close to expiration (within 24 hours)
      const expirationDate = new Date(decoded.exp * 1000);
      const now = new Date();
      const hoursUntilExpiration =
        (expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60);

      let newRefreshToken: string | undefined;
      if (hoursUntilExpiration < 24) {
        // Generate new refresh token
        newRefreshToken = tokenService.generateRefreshToken(tokenPayload);
      }

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message === 'TOKEN_EXPIRED' ||
          error.message === 'INVALID_TOKEN' ||
          error.message === 'TOKEN_INVALID')
      ) {
        throw error;
      }
      console.error('Error refreshing token:', error);
      throw new Error('Token refresh failed');
    }
  }

  /**
   * Logout user
   */
  async logout(refreshToken: string, userId: string): Promise<void> {
    try {
      // Get token expiration
      const expiresAt = tokenService.getTokenExpiration(refreshToken);

      // Blacklist the refresh token
      await tokenService.blacklistToken(refreshToken, userId, expiresAt);
    } catch (error) {
      console.error('Error during logout:', error);
      throw new Error('Logout failed');
    }
  }

  /**
   * Request password reset
   */
  async forgotPassword(email: string): Promise<{ resetToken: string }> {
    const supabase = getSupabaseClient();

    try {
      // Find user by email
      const user = await userService.findUserByEmail(email);

      // Always return success to prevent email enumeration
      if (!user) {
        // Generate a fake token to maintain consistent response time
        const fakeToken = crypto.randomBytes(32).toString('hex');
        return { resetToken: fakeToken };
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiration

      // Store reset token in database
      const { error } = await supabase.from('password_reset_tokens').insert({
        user_id: user.id,
        token: resetToken,
        expires_at: expiresAt.toISOString(),
        used: false,
      });

      if (error) {
        throw error;
      }

      return { resetToken };
    } catch (error) {
      console.error('Error during forgot password:', error);
      throw new Error('Password reset request failed');
    }
  }

  /**
   * Reset password
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const supabase = getSupabaseClient();

    try {
      // Find reset token
      const { data: resetTokenData, error: findError } = await supabase
        .from('password_reset_tokens')
        .select('*')
        .eq('token', token)
        .eq('used', false)
        .single();

      if (findError || !resetTokenData) {
        throw new Error('INVALID_TOKEN');
      }

      // Check if token is expired
      const expiresAt = new Date(resetTokenData.expires_at);
      if (expiresAt < new Date()) {
        throw new Error('TOKEN_EXPIRED');
      }

      // Hash new password
      const passwordHash = await userService.hashPassword(newPassword);

      // Update user password
      await userService.updateUser(resetTokenData.user_id, {
        password_hash: passwordHash,
      });

      // Mark token as used
      const { error: updateError } = await supabase
        .from('password_reset_tokens')
        .update({ used: true })
        .eq('id', resetTokenData.id);

      if (updateError) {
        throw updateError;
      }
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message === 'INVALID_TOKEN' || error.message === 'TOKEN_EXPIRED')
      ) {
        throw error;
      }
      console.error('Error during password reset:', error);
      throw new Error('Password reset failed');
    }
  }

  /**
   * Verify email
   */
  async verifyEmail(token: string): Promise<void> {
    const supabase = getSupabaseClient();

    try {
      // Find verification token
      const { data: verificationTokenData, error: findError } = await supabase
        .from('email_verification_tokens')
        .select('*')
        .eq('token', token)
        .eq('used', false)
        .single();

      if (findError || !verificationTokenData) {
        throw new Error('INVALID_TOKEN');
      }

      // Check if token is expired
      const expiresAt = new Date(verificationTokenData.expires_at);
      if (expiresAt < new Date()) {
        throw new Error('TOKEN_EXPIRED');
      }

      // Mark email as verified
      await userService.updateUser(verificationTokenData.user_id, {
        is_email_verified: true,
      });

      // Mark token as used
      const { error: updateError } = await supabase
        .from('email_verification_tokens')
        .update({ used: true })
        .eq('id', verificationTokenData.id);

      if (updateError) {
        throw updateError;
      }
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message === 'INVALID_TOKEN' || error.message === 'TOKEN_EXPIRED')
      ) {
        throw error;
      }
      console.error('Error during email verification:', error);
      throw new Error('Email verification failed');
    }
  }

  /**
   * Generate email verification token (helper method)
   */
  private async generateEmailVerificationToken(userId: string): Promise<string> {
    const supabase = getSupabaseClient();

    try {
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiration

      const { error } = await supabase.from('email_verification_tokens').insert({
        user_id: userId,
        token: verificationToken,
        expires_at: expiresAt.toISOString(),
        used: false,
      });

      if (error) {
        throw error;
      }

      return verificationToken;
    } catch (error) {
      console.error('Error generating email verification token:', error);
      throw new Error('Failed to generate verification token');
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
