import { Router } from 'express';
import {
  register,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
  getCurrentUser,
} from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth.middleware';
import {
  loginRateLimiter,
  registerRateLimiter,
  passwordResetRateLimiter,
} from '../middleware/rate-limit.middleware';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user
 * Rate limited: 3 attempts per hour per IP
 */
router.post('/register', registerRateLimiter, register);

/**
 * POST /api/auth/login
 * Login user
 * Rate limited: 5 attempts per 15 minutes per IP/email
 */
router.post('/login', loginRateLimiter, login);

/**
 * POST /api/auth/refresh
 * Refresh access token
 */
router.post('/refresh', refresh);

/**
 * POST /api/auth/logout
 * Logout user (requires authentication)
 */
router.post('/logout', requireAuth, logout);

/**
 * POST /api/auth/forgot-password
 * Request password reset
 * Rate limited: 3 attempts per hour per IP
 */
router.post('/forgot-password', passwordResetRateLimiter, forgotPassword);

/**
 * POST /api/auth/reset-password
 * Reset password with token
 */
router.post('/reset-password', resetPassword);

/**
 * POST /api/auth/verify-email
 * Verify email address with token
 */
router.post('/verify-email', verifyEmail);

/**
 * GET /api/auth/me
 * Get current authenticated user
 * Requires authentication
 */
router.get('/me', requireAuth, getCurrentUser);

export default router;
