import { Request, Response, NextFunction } from 'express';
import { isProduction } from '../config/env';

/**
 * Middleware to enforce HTTPS in production
 * Redirects HTTP requests to HTTPS
 */
export const enforceHttps = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Only enforce HTTPS in production
  if (!isProduction()) {
    next();
    return;
  }

  // Check if request is already secure
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    next();
    return;
  }

  // Redirect to HTTPS
  const httpsUrl = `https://${req.hostname}${req.url}`;
  res.redirect(301, httpsUrl);
};

/**
 * Middleware to set secure cookie flags in production
 * This should be used when setting cookies
 */
export const getSecureCookieOptions = () => {
  const baseOptions = {
    httpOnly: true,
    sameSite: 'strict' as const,
    path: '/',
  };

  if (isProduction()) {
    return {
      ...baseOptions,
      secure: true, // Only send cookie over HTTPS
    };
  }

  return baseOptions;
};

/**
 * Middleware to add security headers for HTTPS
 */
export const httpsSecurityHeaders = (
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (isProduction()) {
    // Strict-Transport-Security header (HSTS)
    // Tells browsers to only use HTTPS for this domain for 1 year
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  next();
};
