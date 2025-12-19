import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

/**
 * Request logging middleware
 * Logs all incoming requests with method, path, IP, and response time
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const startTime = Date.now();

  // Log request
  logger.info('Incoming request', {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logLevel = res.statusCode >= 400 ? 'warn' : 'info';

    logger.log(logLevel, 'Request completed', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
    });
  });

  next();
};

/**
 * Authentication event logger
 * Logs authentication-related events
 */
export const logAuthEvent = (
  event: string,
  userId?: string,
  email?: string,
  success: boolean = true,
  details?: any
): void => {
  const logLevel = success ? 'info' : 'warn';

  logger.log(logLevel, `Auth event: ${event}`, {
    event,
    userId,
    email,
    success,
    timestamp: new Date().toISOString(),
    ...details,
  });
};
