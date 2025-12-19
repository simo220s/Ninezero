import { Request } from 'express';

/**
 * User interface (database model)
 */
export interface User {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role: string;
  is_email_verified: boolean;
  is_trial: boolean;
  trial_completed: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * User profile interface (without sensitive data)
 */
export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isEmailVerified: boolean;
  isTrial: boolean;
  trialCompleted: boolean;
}

/**
 * Token payload interface
 */
export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * Decoded token interface (includes JWT standard fields)
 */
export interface DecodedToken extends TokenPayload {
  iat: number; // Issued at
  exp: number; // Expiration time
}

/**
 * Authentication response interface
 */
export interface AuthResponse {
  user: UserProfile;
  accessToken: string;
  refreshToken: string;
}

/**
 * Token response interface
 */
export interface TokenResponse {
  accessToken: string;
  refreshToken?: string;
}

/**
 * Register DTO (Data Transfer Object)
 */
export interface RegisterDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: string;
}

/**
 * Create user DTO
 */
export interface CreateUserDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
}

/**
 * Login DTO
 */
export interface LoginDTO {
  email: string;
  password: string;
}

/**
 * Refresh token DTO
 */
export interface RefreshTokenDTO {
  refreshToken: string;
}

/**
 * Forgot password DTO
 */
export interface ForgotPasswordDTO {
  email: string;
}

/**
 * Reset password DTO
 */
export interface ResetPasswordDTO {
  token: string;
  newPassword: string;
}

/**
 * Verify email DTO
 */
export interface VerifyEmailDTO {
  token: string;
}

/**
 * Success response type
 */
export interface SuccessResponse<T = any> {
  success: true;
  data: T;
}

/**
 * Error response type
 */
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

/**
 * API response type (union of success and error)
 */
export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse;

/**
 * Extended Express Request with user
 */
export interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
    role: string;
  };
}

/**
 * JWT configuration interface
 */
export interface JWTConfig {
  secret: string;
  accessTokenExpiration: string;
  refreshTokenExpiration: string;
}

/**
 * Supabase configuration interface
 */
export interface SupabaseConfig {
  url: string;
  serviceRoleKey: string;
}

/**
 * Environment variables interface
 */
export interface EnvironmentVariables {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  JWT_SECRET: string;
  JWT_ACCESS_EXPIRATION: string;
  JWT_REFRESH_EXPIRATION: string;
  CORS_ORIGINS: string;
  LOG_LEVEL: string;
  RATE_LIMIT_WINDOW_MS: string;
  RATE_LIMIT_MAX_REQUESTS: string;
}

/**
 * User role enum
 */
export enum UserRole {
  STUDENT = 'student',
  TEACHER = 'teacher',
  ADMIN = 'admin',
}

/**
 * Token type enum
 */
export enum TokenType {
  ACCESS = 'access',
  REFRESH = 'refresh',
  PASSWORD_RESET = 'password_reset',
  EMAIL_VERIFICATION = 'email_verification',
}

/**
 * HTTP status code enum
 */
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
}

/**
 * Error code enum
 */
export enum ErrorCode {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  EMAIL_EXISTS = 'EMAIL_EXISTS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_BLACKLISTED = 'TOKEN_BLACKLISTED',
  MISSING_TOKEN = 'MISSING_TOKEN',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  SERVER_ERROR = 'SERVER_ERROR',
  NOT_FOUND = 'NOT_FOUND',
}
