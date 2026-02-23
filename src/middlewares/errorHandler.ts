import { Request, Response, NextFunction } from 'express';
import { ApiError } from '@/utils/errors';
import { ResponseHandler } from '@/utils/response';
import { logger } from '@/utils/logger';
import { env } from '@/config/environment';

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): Response | void {
  if (res.headersSent) {
    return next(error);
  }

  // Log the error
  logger.error({
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
    },
    request: {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
    },
  }, 'Unhandled error occurred');

  // Handle operational errors
  if (error instanceof ApiError) {
    return ResponseHandler.error(res, error.message, error.statusCode, error.code);
  }

  // Handle Prisma errors
  if (error.name === 'PrismaClientKnownRequestError') {
    return handlePrismaError(error, res);
  }

  // Handle validation errors
  if (error.name === 'ValidationError' || error.name === 'ZodError') {
    return ResponseHandler.error(res, 'Validation failed', 400, 'VALIDATION_ERROR');
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    return ResponseHandler.error(res, 'Invalid token', 401, 'INVALID_TOKEN');
  }

  if (error.name === 'TokenExpiredError') {
    return ResponseHandler.error(res, 'Token expired', 401, 'TOKEN_EXPIRED');
  }

  // Default error response
  const message = env.NODE_ENV === 'production' ? 'Internal server error' : error.message;
  return ResponseHandler.error(res, message, 500, 'INTERNAL_ERROR');
}

function handlePrismaError(error: any, res: Response): Response {
  switch (error.code) {
    case 'P2002':
      return ResponseHandler.error(res, 'Resource already exists', 409, 'DUPLICATE_RESOURCE');
    case 'P2025':
      return ResponseHandler.error(res, 'Resource not found', 404, 'RESOURCE_NOT_FOUND');
    case 'P2003':
      return ResponseHandler.error(res, 'Foreign key constraint failed', 400, 'FOREIGN_KEY_ERROR');
    default:
      return ResponseHandler.error(res, 'Database error', 500, 'DATABASE_ERROR');
  }
}

export function notFoundHandler(req: Request, res: Response): Response {
  return ResponseHandler.error(res, `Route ${req.originalUrl} not found`, 404, 'ROUTE_NOT_FOUND');
}