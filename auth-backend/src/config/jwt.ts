export interface JWTConfig {
  secret: string;
  accessTokenExpiration: string;
  refreshTokenExpiration: string;
}

/**
 * Get JWT configuration from environment variables
 */
export const getJWTConfig = (): JWTConfig => {
  const secret = process.env.JWT_SECRET;
  const accessTokenExpiration = process.env.JWT_ACCESS_EXPIRATION || '15m';
  const refreshTokenExpiration = process.env.JWT_REFRESH_EXPIRATION || '7d';

  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }

  if (secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }

  return {
    secret,
    accessTokenExpiration,
    refreshTokenExpiration,
  };
};
