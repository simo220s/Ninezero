import { Response } from 'express';

/**
 * Success response interface
 */
export interface SuccessResponse<T = any> {
  success: true;
  data: T;
}

/**
 * Error response interface
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
 * Send success response
 * @param res - Express response object
 * @param data - Response data
 * @param statusCode - HTTP status code (default: 200)
 */
export const successResponse = <T = any>(
  res: Response,
  data: T,
  statusCode: number = 200
): void => {
  const response: SuccessResponse<T> = {
    success: true,
    data,
  };

  res.status(statusCode).json(response);
};

/**
 * Send error response
 * @param res - Express response object
 * @param code - Error code
 * @param message - Error message
 * @param statusCode - HTTP status code (default: 400)
 * @param details - Optional error details
 */
export const errorResponse = (
  res: Response,
  code: string,
  message: string,
  statusCode: number = 400,
  details?: any
): void => {
  const response: ErrorResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
  };

  res.status(statusCode).json(response);
};

/**
 * Send created response (201)
 * @param res - Express response object
 * @param data - Response data
 */
export const createdResponse = <T = any>(res: Response, data: T): void => {
  successResponse(res, data, 201);
};

/**
 * Send no content response (204)
 * @param res - Express response object
 */
export const noContentResponse = (res: Response): void => {
  res.status(204).send();
};

/**
 * Send unauthorized response (401)
 * @param res - Express response object
 * @param message - Error message
 * @param code - Error code (default: UNAUTHORIZED)
 */
export const unauthorizedResponse = (
  res: Response,
  message: string,
  code: string = 'UNAUTHORIZED'
): void => {
  errorResponse(res, code, message, 401);
};

/**
 * Send forbidden response (403)
 * @param res - Express response object
 * @param message - Error message
 * @param code - Error code (default: FORBIDDEN)
 */
export const forbiddenResponse = (
  res: Response,
  message: string,
  code: string = 'FORBIDDEN'
): void => {
  errorResponse(res, code, message, 403);
};

/**
 * Send not found response (404)
 * @param res - Express response object
 * @param message - Error message
 * @param code - Error code (default: NOT_FOUND)
 */
export const notFoundResponse = (
  res: Response,
  message: string,
  code: string = 'NOT_FOUND'
): void => {
  errorResponse(res, code, message, 404);
};

/**
 * Send conflict response (409)
 * @param res - Express response object
 * @param message - Error message
 * @param code - Error code (default: CONFLICT)
 */
export const conflictResponse = (
  res: Response,
  message: string,
  code: string = 'CONFLICT'
): void => {
  errorResponse(res, code, message, 409);
};

/**
 * Send validation error response (400)
 * @param res - Express response object
 * @param message - Error message
 * @param details - Validation error details
 */
export const validationErrorResponse = (
  res: Response,
  message: string,
  details?: any
): void => {
  errorResponse(res, 'VALIDATION_ERROR', message, 400, details);
};

/**
 * Send internal server error response (500)
 * @param res - Express response object
 * @param message - Error message (default: حدث خطأ في الخادم)
 */
export const serverErrorResponse = (
  res: Response,
  message: string = 'حدث خطأ في الخادم'
): void => {
  errorResponse(res, 'SERVER_ERROR', message, 500);
};
