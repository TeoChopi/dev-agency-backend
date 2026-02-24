import { logger } from '@/utils/logger';

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code?: string;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    code?: string,
    stack?: string
  ) {
    super(message);
    
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }

    logger.error({
      message: this.message,
      statusCode: this.statusCode,
      code: this.code,
      stack: this.stack,
    }, 'ApiError created');
  }

  public static badRequest(message: string, code?: string): ApiError {
    return new ApiError(message, 400, true, code);
  }

  public static unauthorized(message: string = 'Unauthorized', code?: string): ApiError {
    return new ApiError(message, 401, true, code);
  }

  public static forbidden(message: string = 'Forbidden', code?: string): ApiError {
    return new ApiError(message, 403, true, code);
  }

  public static notFound(message: string = 'Resource not found', code?: string): ApiError {
    return new ApiError(message, 404, true, code);
  }

  public static conflict(message: string, code?: string): ApiError {
    return new ApiError(message, 409, true, code);
  }

  public static unprocessableEntity(message: string, code?: string): ApiError {
    return new ApiError(message, 422, true, code);
  }

  public static tooManyRequests(message: string = 'Too many requests', code?: string): ApiError {
    return new ApiError(message, 429, true, code);
  }

  public static internal(message: string = 'Internal server error', code?: string): ApiError {
    return new ApiError(message, 500, true, code);
  }
}