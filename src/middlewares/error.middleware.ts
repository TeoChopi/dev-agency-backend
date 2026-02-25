import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { ApiError } from '../utils/errors';
import { HTTP_STATUS, ERROR_CODES, MESSAGES } from '../utils/constants';
import { logger } from '../utils/logger';
import { ApiResponse } from '../models/product.model';

/**
 * Global error handler middleware
 */
export const errorHandler: ErrorRequestHandler = (
  error: Error,
  req: Request,
  res: Response<ApiResponse<never>>,
  _next: NextFunction
): void => {
  logger.error('Error occurred', {
    error: error.message,
    stack: error.stack,
    method: req.method,
    url: req.url,
    params: req.params,
    query: req.query,
    body: req.body,
  });

  // Handle API errors
  if (error instanceof ApiError) {
    res.status(error.statusCode).json({
      success: false,
      error: {
        message: error.message,
        code: error.errorCode,
      },
    });
    return;
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const message = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: {
        message: `Validation failed: ${message}`,
        code: ERROR_CODES.VALIDATION_ERROR,
      },
    });
    return;
  }

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        res.status(HTTP_STATUS.CONFLICT).json({
          success: false,
          error: {
            message: 'Resource already exists',
            code: ERROR_CODES.BAD_REQUEST,
          },
        });
        return;
      case 'P2025':
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: {
            message: 'Resource not found',
            code: ERROR_CODES.NOT_FOUND,
          },
        });
        return;
      default:
        break;
    }
  }

  // Handle database connection errors
  if (error instanceof Prisma.PrismaClientInitializationError ||
      error instanceof Prisma.PrismaClientRustPanicError) {
    res.status(HTTP_STATUS.SERVICE_UNAVAILABLE).json({
      success: false,
      error: {
        message: 'Database service unavailable',
        code: ERROR_CODES.INTERNAL_ERROR,
      },
    });
    return;
  }

  // Default error response
  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    error: {
      message: MESSAGES.INTERNAL_ERROR,
      code: ERROR_CODES.INTERNAL_ERROR,
    },
  });
};