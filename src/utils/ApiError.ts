/**
 * Custom API Error class for handling application errors
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly timestamp: string;

  constructor(
    statusCode: number,
    message: string,
    code?: string,
    isOperational = true,
    stack = ''
  ) {
    super(message);
    
    this.statusCode = statusCode;
    this.code = code || this.getDefaultCode(statusCode);
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Get default error code based on status code
   */
  private getDefaultCode(statusCode: number): string {
    switch (statusCode) {
      case 400:
        return 'BAD_REQUEST';
      case 401:
        return 'UNAUTHORIZED';
      case 403:
        return 'FORBIDDEN';
      case 404:
        return 'NOT_FOUND';
      case 409:
        return 'CONFLICT';
      case 422:
        return 'VALIDATION_ERROR';
      case 429:
        return 'RATE_LIMIT_EXCEEDED';
      case 500:
        return 'INTERNAL_SERVER_ERROR';
      default:
        return 'UNKNOWN_ERROR';
    }
  }

  /**
   * Create a Bad Request error
   */
  static badRequest(message: string, code?: string): ApiError {
    return new ApiError(400, message, code);
  }

  /**
   * Create an Unauthorized error
   */
  static unauthorized(message: string, code?: string): ApiError {
    return new ApiError(401, message, code);
  }

  /**
   * Create a Forbidden error
   */
  static forbidden(message: string, code?: string): ApiError {
    return new ApiError(403, message, code);
  }

  /**
   * Create a Not Found error
   */
  static notFound(message: string, code?: string): ApiError {
    return new ApiError(404, message, code);
  }

  /**
   * Create a Conflict error
   */
  static conflict(message: string, code?: string): ApiError {
    return new ApiError(409, message, code);
  }

  /**
   * Create a Validation error
   */
  static validation(message: string, code?: string): ApiError {
    return new ApiError(422, message, code);
  }

  /**
   * Create an Internal Server error
   */
  static internal(message: string, code?: string): ApiError {
    return new ApiError(500, message, code);
  }
}