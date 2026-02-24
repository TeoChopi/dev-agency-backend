import { Request, Response, NextFunction } from 'express';
import { ApiError } from '@/utils/apiError';
import { ApiResponse } from '@/utils/apiResponse';
import { logger } from '@/utils/logger';
import { env } from '@/config/env';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  if (res.headersSent) {
    return next(error);
  }

  let apiError: ApiError;

  if (error instanceof ApiError) {
    apiError = error;
  } else {
    // Handle known error types
    if (error.name === 'ValidationError') {
      apiError = ApiError.badRequest(error.message, 'VALIDATION_ERROR');
    } else if (error.name === 'CastError') {
      apiError = ApiError.badRequest('Invalid ID format', 'INVALID_ID');
    } else if (error.name === 'JsonWebTokenError') {
      apiError = ApiError.unauthorized('Invalid token', 'INVALID_TOKEN');
    } else if (error.name === 'TokenExpiredError') {
      apiError = ApiError.unauthorized('Token expired', 'TOKEN_EXPIRED');
    } else {
      // Unknown error - log it and return generic error
      logger.error({
        error: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        body: req.body,
        params: req.params,
        query: req.query,
        headers: req.headers,
      }, 'Unhandled error');

      apiError = ApiError.internal(
        env.NODE_ENV === 'production' ? 'Something went wrong' : error.message,
        'INTERNAL_ERROR'
      );
    }
  }

  // Log operational errors in development
  if (env.NODE_ENV === 'development' && apiError.isOperational) {
    logger.warn({
      message: apiError.message,
      statusCode: apiError.statusCode,
      code: apiError.code,
      url: req.url,
      method: req.method,
    }, 'Operational error');
  }

  return ApiResponse.error(res, apiError.message, apiError.statusCode, apiError.code);
};

export const notFoundHandler = (req: Request, res: Response): Response => {
  return ApiResponse.error(res, `Route ${req.method} ${req.path} not found`, 404, 'ROUTE_NOT_FOUND');
};