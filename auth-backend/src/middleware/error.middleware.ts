import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { ERROR_MESSAGES } from '../utils/constants';
import { ZodError } from 'zod';

/**
 * Global error handler middleware
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log error with context
  const timestamp = new Date().toISOString();
  const requestInfo = {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  };

  console.error('Error occurred:', {
    timestamp,
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack,
    },
    request: requestInfo,
  });

  // Handle operational errors (AppError instances)
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err instanceof Error && (err as any).details
          ? { details: (err as any).details }
          : {}),
      },
    });
    return;
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const formattedErrors = err.issues.map((issue: any) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));

    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: ERROR_MESSAGES.VALIDATION_ERROR,
        details: formattedErrors,
      },
    });
    return;
  }

  // Handle specific known errors
  if (err.message === 'EMAIL_EXISTS') {
    res.status(409).json({
      success: false,
      error: {
        code: 'EMAIL_EXISTS',
        message: ERROR_MESSAGES.EMAIL_EXISTS,
      },
    });
    return;
  }

  if (err.message === 'INVALID_CREDENTIALS') {
    res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_CREDENTIALS',
        message: ERROR_MESSAGES.INVALID_CREDENTIALS,
      },
    });
    return;
  }

  if (err.message === 'TOKEN_EXPIRED') {
    res.status(401).json({
      success: false,
      error: {
        code: 'TOKEN_EXPIRED',
        message: ERROR_MESSAGES.TOKEN_EXPIRED,
      },
    });
    return;
  }

  if (err.message === 'INVALID_TOKEN') {
    res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: ERROR_MESSAGES.INVALID_TOKEN,
      },
    });
    return;
  }

  // Handle unknown errors (don't expose sensitive information)
  res.status(500).json({
    success: false,
    error: {
      code: 'SERVER_ERROR',
      message: ERROR_MESSAGES.SERVER_ERROR,
    },
  });
};

/**
 * Handle 404 errors for undefined routes
 */
export const notFoundHandler = (
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: ERROR_MESSAGES.NOT_FOUND,
    },
  });
};
