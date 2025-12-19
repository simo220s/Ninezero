import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from '../validators/auth.validators';
import { logAuthEvent } from '../middleware/request-logger.middleware';

/**
 * Register controller
 * POST /api/auth/register
 */
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Validate request body
    const validatedData = registerSchema.parse(req.body);

    // Register user
    const result = await authService.register(validatedData);

    // Log successful registration
    logAuthEvent('registration', result.user.id, result.user.email, true);

    // Return response
    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    // Log failed registration
    logAuthEvent('registration', undefined, req.body?.email, false, {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    next(error);
  }
};

/**
 * Login controller
 * POST /api/auth/login
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Validate request body
    const validatedData = loginSchema.parse(req.body);

    // Login user
    const result = await authService.login(
      validatedData.email,
      validatedData.password
    );

    // Log successful login
    logAuthEvent('login', result.user.id, result.user.email, true);

    // Return response
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    // Log failed login
    logAuthEvent('login', undefined, req.body?.email, false, {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    next(error);
  }
};

/**
 * Refresh token controller
 * POST /api/auth/refresh
 */
export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Validate request body
    const validatedData = refreshTokenSchema.parse(req.body);

    // Refresh token
    const result = await authService.refreshToken(validatedData.refreshToken);

    // Log token refresh
    logAuthEvent('token_refresh', req.user?.userId, req.user?.email, true);

    // Return response
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    // Log failed token refresh
    logAuthEvent('token_refresh', req.user?.userId, req.user?.email, false, {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    next(error);
  }
};

/**
 * Logout controller
 * POST /api/auth/logout
 */
export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Validate request body
    const validatedData = refreshTokenSchema.parse(req.body);

    // Ensure user is authenticated
    if (!req.user) {
      throw new Error('UNAUTHORIZED');
    }

    // Logout user
    await authService.logout(validatedData.refreshToken, req.user.userId);

    // Log successful logout
    logAuthEvent('logout', req.user.userId, req.user.email, true);

    // Return response
    res.status(200).json({
      success: true,
      data: {
        message: 'تم تسجيل الخروج بنجاح',
      },
    });
  } catch (error) {
    // Log failed logout
    logAuthEvent('logout', req.user?.userId, req.user?.email, false, {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    next(error);
  }
};

/**
 * Forgot password controller
 * POST /api/auth/forgot-password
 */
export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Validate request body
    const validatedData = forgotPasswordSchema.parse(req.body);

    // Request password reset
    const result = await authService.forgotPassword(validatedData.email);

    // Log password reset request
    logAuthEvent('password_reset_request', undefined, validatedData.email, true);

    // Return response
    res.status(200).json({
      success: true,
      data: {
        message: 'تم إرسال رابط إعادة تعيين كلمة المرور',
        resetToken: result.resetToken, // In production, this would be sent via email
      },
    });
  } catch (error) {
    // Log failed password reset request
    logAuthEvent(
      'password_reset_request',
      undefined,
      req.body?.email,
      false,
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    );
    next(error);
  }
};

/**
 * Reset password controller
 * POST /api/auth/reset-password
 */
export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Validate request body
    const validatedData = resetPasswordSchema.parse(req.body);

    // Reset password
    await authService.resetPassword(
      validatedData.token,
      validatedData.newPassword
    );

    // Log successful password reset
    logAuthEvent('password_reset', undefined, undefined, true);

    // Return response
    res.status(200).json({
      success: true,
      data: {
        message: 'تم تغيير كلمة المرور بنجاح',
      },
    });
  } catch (error) {
    // Log failed password reset
    logAuthEvent('password_reset', undefined, undefined, false, {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    next(error);
  }
};

/**
 * Verify email controller
 * POST /api/auth/verify-email
 */
export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Validate request body
    const validatedData = verifyEmailSchema.parse(req.body);

    // Verify email
    await authService.verifyEmail(validatedData.token);

    // Log successful email verification
    logAuthEvent('email_verification', undefined, undefined, true);

    // Return response
    res.status(200).json({
      success: true,
      data: {
        message: 'تم التحقق من البريد الإلكتروني بنجاح',
      },
    });
  } catch (error) {
    // Log failed email verification
    logAuthEvent('email_verification', undefined, undefined, false, {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    next(error);
  }
};

/**
 * Get current user controller
 * GET /api/auth/me
 */
export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Ensure user is authenticated
    if (!req.user) {
      throw new Error('UNAUTHORIZED');
    }

    // Return user data from request (already attached by auth middleware)
    res.status(200).json({
      success: true,
      data: {
        user: req.user,
      },
    });
  } catch (error) {
    next(error);
  }
};
