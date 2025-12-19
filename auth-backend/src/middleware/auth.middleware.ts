import { Request, Response, NextFunction } from 'express';
import { getSupabaseClient } from '../config/supabase';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
      };
    }
  }
}

/**
 * Middleware to require authentication
 * Verifies Supabase JWT token and attaches user to request
 * 
 * UPDATED: Now verifies Supabase JWT tokens instead of custom tokens
 * This aligns with the frontend auth system
 */
export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: {
          code: 'MISSING_TOKEN',
          message: 'رمز المصادقة مطلوب',
        },
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token with Supabase
    const supabase = getSupabaseClient();
    
    try {
      // Use Supabase to verify the JWT token
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (error || !user) {
        console.error('Supabase token verification failed:', error);
        res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'رمز غير صحيح',
          },
        });
        return;
      }

      // Fetch user profile from profiles table to get role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        // Default to student role if profile not found
      }

      // Attach user data to request
      req.user = {
        userId: user.id,
        email: user.email || '',
        role: profile?.role || 'student',
      };

      next();
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_VERIFICATION_FAILED',
          message: 'فشل التحقق من الرمز',
        },
      });
      return;
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'حدث خطأ في الخادم',
      },
    });
  }
};

/**
 * Middleware factory to require specific role
 */
export const requireRole = (allowedRoles: string | string[]) => {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Ensure user is authenticated first
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'يجب تسجيل الدخول أولاً',
          },
        });
        return;
      }

      // Check if user has required role
      if (!roles.includes(req.user.role)) {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'ليس لديك صلاحية للوصول إلى هذا المورد',
          },
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Role authorization error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'حدث خطأ في الخادم',
        },
      });
    }
  };
};

/**
 * Optional authentication middleware
 * Attaches user to request if token is present and valid, but doesn't fail if not
 * 
 * UPDATED: Now verifies Supabase JWT tokens
 */
export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without user
      next();
      return;
    }

    const token = authHeader.substring(7);
    const supabase = getSupabaseClient();

    // Try to verify token with Supabase
    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (!error && user) {
        // Fetch user profile to get role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        // Attach user data to request
        req.user = {
          userId: user.id,
          email: user.email || '',
          role: profile?.role || 'student',
        };
      }
    } catch (error) {
      // Token is invalid or expired, continue without user
      // Don't throw error for optional auth
    }

    next();
  } catch (error) {
    console.error('Optional authentication error:', error);
    // Continue without user even if there's an error
    next();
  }
};
