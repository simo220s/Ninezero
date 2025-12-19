import jwt from 'jsonwebtoken';
import { getJWTConfig } from '../config/jwt';
import { getSupabaseClient } from '../config/supabase';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export interface DecodedToken extends TokenPayload {
  iat: number;
  exp: number;
}

class TokenService {
  private get jwtConfig() {
    return getJWTConfig();
  }

  /**
   * Generate access token with 15-minute expiration
   */
  generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(
      payload,
      this.jwtConfig.secret,
      {
        expiresIn: this.jwtConfig.accessTokenExpiration,
      } as jwt.SignOptions
    );
  }

  /**
   * Generate refresh token with 7-day expiration
   */
  generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(
      payload,
      this.jwtConfig.secret,
      {
        expiresIn: this.jwtConfig.refreshTokenExpiration,
      } as jwt.SignOptions
    );
  }

  /**
   * Verify access token signature and expiration
   */
  verifyAccessToken(token: string): DecodedToken {
    try {
      const decoded = jwt.verify(token, this.jwtConfig.secret) as DecodedToken;
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('TOKEN_EXPIRED');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('INVALID_TOKEN');
      }
      throw error;
    }
  }

  /**
   * Verify refresh token signature and expiration
   */
  verifyRefreshToken(token: string): DecodedToken {
    try {
      const decoded = jwt.verify(token, this.jwtConfig.secret) as DecodedToken;
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('TOKEN_EXPIRED');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('INVALID_TOKEN');
      }
      throw error;
    }
  }

  /**
   * Check if token is blacklisted
   */
  async isTokenBlacklisted(token: string): Promise<boolean> {
    const supabase = getSupabaseClient();

    try {
      const { data, error } = await supabase
        .from('token_blacklist')
        .select('id')
        .eq('token', token)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 is "not found" error, which is expected
        throw error;
      }

      return !!data;
    } catch (error) {
      console.error('Error checking token blacklist:', error);
      throw new Error('Failed to check token blacklist');
    }
  }

  /**
   * Add token to blacklist
   */
  async blacklistToken(
    token: string,
    userId: string,
    expiresAt: Date
  ): Promise<void> {
    const supabase = getSupabaseClient();

    try {
      const { error } = await supabase.from('token_blacklist').insert({
        token,
        user_id: userId,
        expires_at: expiresAt.toISOString(),
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error blacklisting token:', error);
      throw new Error('Failed to blacklist token');
    }
  }

  /**
   * Get token expiration date from decoded token
   */
  getTokenExpiration(token: string): Date {
    try {
      const decoded = jwt.decode(token) as DecodedToken;
      if (!decoded || !decoded.exp) {
        throw new Error('Invalid token format');
      }
      return new Date(decoded.exp * 1000);
    } catch (error) {
      throw new Error('Failed to decode token');
    }
  }
}

// Export singleton instance
export const tokenService = new TokenService();
