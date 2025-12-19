import { Request, Response, NextFunction } from 'express';

// Extend Express Request to include audit info
declare global {
  namespace Express {
    interface Request {
      auditInfo?: {
        ipAddress: string;
        userAgent: string;
      };
    }
  }
}

/**
 * Middleware to extract and attach audit information to request
 */
export const auditMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  // Extract IP address
  const ipAddress =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    (req.headers['x-real-ip'] as string) ||
    req.socket.remoteAddress ||
    'unknown';

  // Extract user agent
  const userAgent = req.headers['user-agent'] || 'unknown';

  // Attach to request
  req.auditInfo = {
    ipAddress,
    userAgent,
  };

  next();
};
