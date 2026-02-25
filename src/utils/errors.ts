import { HTTP_STATUS, ERROR_CODES } from './constants';

/**
 * Custom API Error class for structured error handling
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    errorCode: string = ERROR_CODES.INTERNAL_ERROR,
    isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = isOperational;

    // Ensure the stack trace points to where the error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Create a Bad Request error
 */
export function createBadRequestError(message: string): ApiError {
  return new ApiError(message, HTTP_STATUS.BAD_REQUEST, ERROR_CODES.BAD_REQUEST);
}

/**
 * Create a Not Found error
 */
export function createNotFoundError(message: string): ApiError {
  return new ApiError(message, HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
}

/**
 * Create a Validation error
 */
export function createValidationError(message: string): ApiError {
  return new ApiError(message, HTTP_STATUS.UNPROCESSABLE_ENTITY, ERROR_CODES.VALIDATION_ERROR);
}

/**
 * Create an Internal Server error
 */
export function createInternalError(message: string): ApiError {
  return new ApiError(message, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_CODES.INTERNAL_ERROR);
}

/**
 * Create an Unauthorized error
 */
export function createUnauthorizedError(message: string): ApiError {
  return new ApiError(message, HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED);
}

/**
 * Create a Forbidden error
 */
export function createForbiddenError(message: string): ApiError {
  return new ApiError(message, HTTP_STATUS.FORBIDDEN, ERROR_CODES.FORBIDDEN);
}