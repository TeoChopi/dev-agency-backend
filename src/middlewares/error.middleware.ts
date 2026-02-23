import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/errors';
import { createErrorResponse } from '../utils/response';
import { logger } from '../utils/logger';
import { env } from '../config/env';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error('Error occurred:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
  });

  if (error instanceof ApiError) {
    const response = createErrorResponse(error.message, error.code);
    res.status(error.statusCode).json(response);
    return;
  }

  // Handle Prisma errors
  if (error.name === 'PrismaClientKnownRequestError') {
    const response = createErrorResponse('Database operation failed', 'DATABASE_ERROR');
    res.status(400).json(response);
    return;
  }

  // Handle validation errors
  if (error.name === 'ValidationError' || error.name === 'ZodError') {
    const response = createErrorResponse(error.message, 'VALIDATION_ERROR');
    res.status(400).json(response);
    return;
  }

  // Default error response
  const message = env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : error.message;
    
  const response = createErrorResponse(message, 'INTERNAL_SERVER_ERROR');
  res.status(500).json(response);
};

export const notFoundHandler = (req: Request, res: Response): void => {
  const response = createErrorResponse(
    `Route ${req.originalUrl} not found`,
    'ROUTE_NOT_FOUND'
  );
  res.status(404).json(response);
};